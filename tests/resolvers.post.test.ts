/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="jest" />
import { resolvers } from '@/graphql/resolvers';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    like: { findUnique: jest.fn() },
  })),
}));

describe('Post.viewerHasLiked', () => {
  it('returns true when like exists', async () => {
    const ctx: any = {
      prisma: { like: { findUnique: () => ({ id: 'like1' }) } },
      userId: 'u1',
    };
    const result = await resolvers.Post.viewerHasLiked({ id: 'p1' }, {}, ctx);
    expect(result).toBe(true);
  });
});
