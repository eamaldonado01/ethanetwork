// src/graphql/resolvers.ts
import { GraphQLDateTime } from 'graphql-scalars';
import { publish } from '@/lib/redis.server';
import { CHANNELS } from '@/lib/redis';
import type { GraphQLContext } from '@/lib/context';
import type { Post, User } from '@prisma/client';

export const resolvers = {
  DateTime: GraphQLDateTime,

  Query: {
    me: (_parent: unknown, _args: unknown, ctx: GraphQLContext) =>
      ctx.prisma.user.findUniqueOrThrow({ where: { id: ctx.userId } }),

    user: (
      _parent: unknown,
      { username }: { username: string },
      ctx: GraphQLContext,
    ) =>
      ctx.prisma.user.findUnique({
        where: { username },
      }),

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
        where: { username: { contains: search, mode: 'insensitive' } },
        take: first,
        ...(after && { skip: 1, cursor: { id: after } }),
      }),

    feed: async (
      _parent: unknown,
      { first, after }: { first?: number; after?: string },
      ctx: GraphQLContext,
    ) => {
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
        edges: posts.map((p) => ({
          cursor: p.id,
          node: p as Post & {
            author: User;
            _count: { likes: number; comments: number };
          },
        })),
        hasNextPage: first != null ? posts.length === first : false,
      };
    },
  },

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

    // …other mutations…
  },

  Post: {
    likeCount: (post: { _count?: { likes?: number } }): number =>
      post._count?.likes ?? 0,

    commentCount: (post: { _count?: { comments?: number } }): number =>
      post._count?.comments ?? 0,

    viewerHasLiked: async (
      post: { id: string },
      _args: unknown,
      ctx: GraphQLContext,
    ): Promise<boolean> =>
      Boolean(
        await ctx.prisma.like.findUnique({
          where: {
            userId_postId: { userId: ctx.userId, postId: post.id },
          },
        }),
      ),
  },

  User: {
    followersCount: (
      user: { id: string },
      _args: unknown,
      ctx: GraphQLContext,
    ): Promise<number> =>
      ctx.prisma.follow.count({ where: { followingId: user.id } }),

    followingCount: (
      user: { id: string },
      _args: unknown,
      ctx: GraphQLContext,
    ): Promise<number> =>
      ctx.prisma.follow.count({ where: { followerId: user.id } }),

    isFollowing: async (
      user: { id: string },
      _args: unknown,
      ctx: GraphQLContext,
    ): Promise<boolean> =>
      Boolean(
        await ctx.prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: ctx.userId,
              followingId: user.id,
            },
          },
        }),
      ),
  },
};
