// ────────────────────────────────
// src/graphql/resolvers.ts
// ────────────────────────────────
import { GraphQLDateTime } from 'graphql-scalars';
import { publish } from '@/lib/redis.server';
import { CHANNELS, type Channel } from '@/lib/redis';
import type { GraphQLContext } from '@/lib/context';
import type {
  Post as PrismaPost,
  User as PrismaUser,
  Comment as PrismaComment,
} from '@prisma/client';

/* ------------------------------------------------------------------ */
/* Handy aliases so the code reads nicely                              */
type Post = PrismaPost;
type User = PrismaUser;
type Comment = PrismaComment;

/* ------------------------------------------------------------------ */

export const resolvers = {
  /* ---------------- Scalars ---------------- */
  DateTime: GraphQLDateTime,

  /* ---------------- Queries ---------------- */
  Query: {
    /* ─── current user ─────────────────────── */
    me: (_parent: unknown, _args: unknown, ctx: GraphQLContext) =>
      ctx.prisma.user.findUniqueOrThrow({
        where: { id: ctx.userId },
        include: {
          posts: {
            orderBy: { createdAt: 'desc' },
            include: {
              author: true,
              _count: { select: { likes: true, comments: true } },
            },
          },
          followers: true,
          following: true,
        },
      }),

    /* ─── user by username ─────────────────── */
    user: (
      _parent: unknown,
      { username }: { username: string },
      ctx: GraphQLContext,
    ) =>
      ctx.prisma.user.findUnique({
        where: { username },
        include: {
          posts: {
            orderBy: { createdAt: 'desc' },
            include: {
              author: true,
              _count: { select: { likes: true, comments: true } },
            },
          },
          followers: true,
          following: true,
        },
      }),

    /* ─── search users ─────────────────────── */
    users: (
      _parent: unknown,
      {
        search = '',
        first,
        after,
      }: { search?: string; first?: number; after?: string },
      ctx: GraphQLContext,
    ) =>
      ctx.prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        take: first,
        ...(after && { skip: 1, cursor: { id: after } }),
        include: { followers: true },
      }),

    /* ─── global feed connection ───────────── */
    feed: async (
      _parent: unknown,
      { first, after }: { first?: number; after?: string },
      ctx: GraphQLContext,
    ) => {
      const posts = (await ctx.prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        take: first,
        ...(after && { skip: 1, cursor: { id: after } }),
        include: {
          author: true,
          _count: { select: { likes: true, comments: true } },
        },
      })) as Post[];

      return {
        edges: posts.map((p) => ({ cursor: p.id, node: p })),
        hasNextPage: first != null ? posts.length === first : false,
      };
    },

    /* ─── single post detail ───────────────── */
    post: (_parent: unknown, { id }: { id: string }, ctx: GraphQLContext) =>
      ctx.prisma.post.findUnique({
        where: { id },
        include: {
          author: true,
          comments: {
            orderBy: { createdAt: 'asc' },
            include: { author: true },
          },
          _count: { select: { likes: true, comments: true } },
        },
      }),

    /* deprecated alias kept for legacy callers */
    postById: (_parent: unknown, { id }: { id: string }, ctx: GraphQLContext) =>
      ctx.prisma.post.findUnique({
        where: { id },
        include: {
          author: true,
          comments: {
            orderBy: { createdAt: 'asc' },
            include: { author: true },
          },
          _count: { select: { likes: true, comments: true } },
        },
      }),

    /* ─── top-liked posts ──────────────────── */
    postsByLikes: (
      _parent: unknown,
      { first = 20 }: { first?: number },
      ctx: GraphQLContext,
    ) =>
      ctx.prisma.post.findMany({
        orderBy: { likes: { _count: 'desc' } },
        take: first,
        include: {
          author: true,
          _count: { select: { likes: true, comments: true } },
        },
      }),
  },

  /* ---------------- Mutations -------------- */
  Mutation: {
    createPost: async (
      _parent: unknown,
      args: { content: string; imageUrl?: string },
      ctx: GraphQLContext,
    ) => {
      const post = await ctx.prisma.post.create({
        data: { authorId: ctx.userId, ...args },
        include: {
          author: true,
          _count: { select: { likes: true, comments: true } },
        },
      });
      await publish(CHANNELS.NEW_POST, post.id);
      return post;
    },

    likePost: async (
      _parent: unknown,
      { postId }: { postId: string },
      ctx: GraphQLContext,
    ) => {
      await ctx.prisma.like
        .create({ data: { userId: ctx.userId, postId } })
        .catch(() => {});
      await publish(CHANNELS.LIKE_UPDATE, postId);
      return ctx.prisma.post.findUnique({
        where: { id: postId },
        include: {
          author: true,
          _count: { select: { likes: true, comments: true } },
        },
      });
    },

    unlikePost: async (
      _parent: unknown,
      { postId }: { postId: string },
      ctx: GraphQLContext,
    ) => {
      await ctx.prisma.like
        .delete({
          where: { userId_postId: { userId: ctx.userId, postId } },
        })
        .catch(() => {});
      await publish(CHANNELS.LIKE_UPDATE, postId);
      return ctx.prisma.post.findUnique({
        where: { id: postId },
        include: {
          author: true,
          _count: { select: { likes: true, comments: true } },
        },
      });
    },

    commentOnPost: async (
      _parent: unknown,
      { postId, body }: { postId: string; body: string },
      ctx: GraphQLContext,
    ): Promise<Comment> => {
      const comment = await ctx.prisma.comment.create({
        data: { authorId: ctx.userId, postId, body },
      });
      await publish('new-comment' as Channel, postId);
      return comment;
    },

    /* ---------------- follow / unfollow ------------------------- */
    followUser: async (
      _parent: unknown,
      { userId }: { userId: string },
      ctx: GraphQLContext,
    ) => {
      if (userId !== ctx.userId) {
        await ctx.prisma.follow
          .create({
            data: { followerId: ctx.userId, followingId: userId },
          })
          .catch((err: { code?: string }) => {
            if (err.code !== 'P2002') throw err; // already following
          });
      }
      return ctx.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    },

    unfollowUser: async (
      _parent: unknown,
      { userId }: { userId: string },
      ctx: GraphQLContext,
    ) => {
      if (userId !== ctx.userId) {
        await ctx.prisma.follow.deleteMany({
          where: { followerId: ctx.userId, followingId: userId },
        });
      }
      return ctx.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    },

    /* ─── update profile (github, etc.) ────── */
    updateProfile: async (
      _parent: unknown,
      args: {
        bio?: string | null;
        website?: string | null;
        github?: string | null;
        imageUrl?: string | null;
      },
      ctx: GraphQLContext,
    ) => {
      const data: Record<string, unknown> = {};
      if (args.bio !== undefined) data.bio = args.bio;
      if (args.website !== undefined) data.website = args.website;
      if (args.github !== undefined) data.github = args.github;
      if (args.imageUrl !== undefined) data.imageUrl = args.imageUrl;

      return ctx.prisma.user.update({
        where: { id: ctx.userId },
        data,
      });
    },

    /* ─── delete post ──────────────────────── */
    deletePost: async (
      _parent: unknown,
      { postId }: { postId: string },
      ctx: GraphQLContext,
    ): Promise<boolean> => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      });
      if (!post) throw new Error('Post not found');
      if (post.authorId !== ctx.userId)
        throw new Error('Not authorised to delete this post');

      await ctx.prisma.post.delete({ where: { id: postId } });
      await publish('post-deleted' as Channel, postId);
      return true;
    },

    /* ─── delete comment ───────────────────── */
    deleteComment: async (
      _parent: unknown,
      { commentId }: { commentId: string },
      ctx: GraphQLContext,
    ): Promise<boolean> => {
      const comment = await ctx.prisma.comment.findUnique({
        where: { id: commentId },
        select: { authorId: true },
      });
      if (!comment) throw new Error('Comment not found');
      if (comment.authorId !== ctx.userId)
        throw new Error('Not authorised to delete this comment');

      await ctx.prisma.comment.delete({ where: { id: commentId } });
      await publish('comment-deleted' as Channel, commentId);
      return true;
    },
  },

  /* -------------- Field Resolvers ----------- */
  Post: {
    likeCount: (p: Post & { _count?: { likes?: number } }) =>
      p._count?.likes ?? 0,
    commentCount: (p: Post & { _count?: { comments?: number } }) =>
      p._count?.comments ?? 0,
    viewerHasLiked: async (p: Post, _args: unknown, ctx: GraphQLContext) =>
      Boolean(
        await ctx.prisma.like.findUnique({
          where: {
            userId_postId: { userId: ctx.userId, postId: p.id },
          },
        }),
      ),
  },

  User: {
    followersCount: async (
      parent: Pick<User, 'id'>,
      _args: unknown,
      ctx: GraphQLContext,
    ) => {
      const { _count } = await ctx.prisma.user.findUniqueOrThrow({
        where: { id: parent.id },
        select: { _count: { select: { followers: true } } },
      });
      return _count.followers;
    },

    followingCount: async (
      parent: Pick<User, 'id'>,
      _args: unknown,
      ctx: GraphQLContext,
    ) => {
      const { _count } = await ctx.prisma.user.findUniqueOrThrow({
        where: { id: parent.id },
        select: { _count: { select: { following: true } } },
      });
      return _count.following;
    },

    isFollowing: async (
      parent: Pick<User, 'id'>,
      _args: unknown,
      ctx: GraphQLContext,
    ) => {
      if (!ctx.userId) return false;
      const follow = await ctx.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: ctx.userId,
            followingId: parent.id,
          },
        },
        select: { followerId: true },
      });
      return Boolean(follow);
    },
  },
};
