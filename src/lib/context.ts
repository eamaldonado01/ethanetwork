//
// Runtime GraphQL-context builder (used by /api/graphql)
// -----------------------------------------------------
import type { NextApiRequest, NextApiResponse } from 'next';

import { getSession } from '@auth0/nextjs-auth0';
interface AuthSession {
  user?: { sub?: string };
}
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface GraphQLContext {
  userId: string;
  prisma: PrismaClient;
}

export async function buildContext(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<GraphQLContext> {
  const session = await (
    getSession as (
      req: NextApiRequest,
      res: NextApiResponse,
    ) => Promise<AuthSession>
  )(req, res);

  /* ─── authenticated viewer ────────────────────────────────────── */
  if (session?.user?.sub) {
    return { userId: session.user.sub, prisma };
  }

  /* ─── shared “guest” fallback ─────────────────────────────────── */
  const GUEST_ID = 'guest';

  await prisma.user.upsert({
    where: { id: GUEST_ID },
    update: {},
    create: {
      id: GUEST_ID,
      username: 'guest',
      name: 'Guest User',
      email: 'guest@ethanetwork.com',
      bio: 'I am a shared guest account.',
      imageUrl: null,
    },
  });

  /* set a readable cookie so the client knows it’s the guest user */
  res.setHeader('Set-Cookie', [
    'guestUser=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
    'guestUser=1; Path=/; Max-Age=604800; SameSite=Lax',
  ]);

  return { userId: GUEST_ID, prisma };
}
