import { GraphQLDateTime } from 'graphql-scalars';
import { GraphQLContext } from '@/lib/context';
import { Post as PostModel } from '@prisma/client';

type PostWithCounts = PostModel & {
  _count?: { likes: number; comments: number };
};

export const resolvers = {
  DateTime: GraphQLDateTime,

  Query: {
    me: (_parent: unknown, _args: unknown, ctx: GraphQLContext) =>
      ctx.prisma.user.findUniqueOrThrow({ where: { id: ctx.userId } }),

    user: (
      _p: unknown,
      { username }: { username: string },
      ctx: GraphQLContext,
    ) => ctx.prisma.user.findUnique({ where: { username } }),

    users: async (
      _p: unknown,
      { search = '', first, after },
      ctx: GraphQLContext,
    ) => {
      return ctx.prisma.user.findMany({
        where: { username: { contains: search, mode: 'insensitive' } },
        take: first,
        ...(after && { skip: 1, cursor: { id: after } }),
      });
    },

    feed: async (_p, { first, after }, ctx: GraphQLContext) => {
      const following = await ctx.prisma.follow.findMany({
        where: { followerId: ctx.userId },
        select: { followingId: true },
      });
      const ids = following.map((f) => f.followingId).concat(ctx.userId);

      const posts = await ctx.prisma.post.findMany({
        where: { authorId: { in: ids } },
        orderBy: { createdAt: 'desc' },
        take: first,
        ...(after && { skip: 1, cursor: { id: after } }),
        include: {
          author: true,
          _count: { select: { likes: true, comments: true } },
        },
      });

      return {
        edges: posts.map((p) => ({ cursor: p.id, node: p })),
        hasNextPage: posts.length === first,
      };
    },
  },

  Mutation: {
    createPost: (_p, { content, imageUrl }, ctx: GraphQLContext) =>
      ctx.prisma.post.create({
        data: { authorId: ctx.userId, content, imageUrl },
        include: {
          author: true,
          _count: { select: { likes: true, comments: true } },
        },
      }),

    likePost: (_p, { postId }, ctx) =>
      ctx.prisma.like
        .create({ data: { userId: ctx.userId, postId } })
        .then(() =>
          ctx.prisma.post.findUniqueOrThrow({ where: { id: postId } }),
        ),

    unlikePost: (_p, { postId }, ctx) =>
      ctx.prisma.like
        .delete({ where: { userId_postId: { userId: ctx.userId, postId } } })
        .then(() =>
          ctx.prisma.post.findUniqueOrThrow({ where: { id: postId } }),
        ),

    commentOnPost: (_p, { postId, body }, ctx) =>
      ctx.prisma.comment.create({
        data: { authorId: ctx.userId, postId, body },
        include: { author: true },
      }),

    followUser: (_p, { userId }, ctx) =>
      ctx.prisma.follow
        .create({ data: { followerId: ctx.userId, followingId: userId } })
        .then(() =>
          ctx.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
        ),

    unfollowUser: (_p, { userId }, ctx) =>
      ctx.prisma.follow
        .delete({
          where: {
            followerId_followingId: {
              followerId: ctx.userId,
              followingId: userId,
            },
          },
        })
        .then(() =>
          ctx.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
        ),

    updateProfile: (_p, { bio, imageUrl }, ctx) =>
      ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: { bio, imageUrl },
      }),
  },

  // field‐level resolvers for computed counts / flags
  Post: {
    likeCount: (p: PostWithCounts) => p._count?.likes ?? 0,
    commentCount: (p: PostWithCounts) => p._count?.comments ?? 0,
    viewerHasLiked: async (p: PostModel, _a: unknown, ctx: GraphQLContext) =>
      !!(await ctx.prisma.like.findUnique({
        where: { userId_postId: { userId: ctx.userId, postId: p.id } },
      })),
  },

  User: {
    followersCount: (u, _a, ctx) =>
      ctx.prisma.follow.count({ where: { followingId: u.id } }),
    followingCount: (u, _a, ctx) =>
      ctx.prisma.follow.count({ where: { followerId: u.id } }),
    isFollowing: async (u, _a, ctx) =>
      !!(await ctx.prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId: ctx.userId, followingId: u.id },
        },
      })),
  },
};
