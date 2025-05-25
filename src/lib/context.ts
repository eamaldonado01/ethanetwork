// src/lib/context.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface GraphQLContext {
  prisma: PrismaClient;
  userId: string;
}

export async function buildContext(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<GraphQLContext> {
  // Grab the session that withApiAuthRequired validated
  const session = await getSession(req, res);
  if (!session?.user?.sub) {
    throw new Error('Unauthenticated');
  }

  const userId = session.user.sub.replace(/^auth0\|/, '');

  // Ensure the user exists in your database
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: session.user.email ?? `${userId}@example.com`,
      username: userId,
      name: session.user.name ?? userId,
    },
  });

  return { prisma, userId };
}
