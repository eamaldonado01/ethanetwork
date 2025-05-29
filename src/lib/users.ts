// src/lib/users.ts
// Centralised helper for “public profile” data
import prisma from '@/lib/prisma';

/** Optional `viewerId` lets us compute the caller’s follow-state. */
export async function getPublicUser(
  username: string,
  viewerId: string | null = null,
) {
  /* ---------- single Prisma round-trip ---------- */
  const dbUser = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: { select: { followers: true, following: true } },
      posts: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          imageUrl: true,
          createdAt: true,
          _count: { select: { likes: true, comments: true } },
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  if (!dbUser) return null;

  /* ---------- extra computed field ---------- */
  const isFollowing = viewerId
    ? Boolean(
        await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewerId,
              followingId: dbUser.id,
            },
          },
          select: { followerId: true },
        }),
      )
    : false;

  /* ---------- flatten & adapt shape ---------- */
  return {
    ...dbUser,
    followersCount: dbUser._count.followers,
    followingCount: dbUser._count.following,
    isFollowing,
    posts: dbUser.posts.map((post) => ({
      ...post,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
    })),
  };
}
