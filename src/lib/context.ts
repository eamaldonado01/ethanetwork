import type { NextApiRequest } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface GraphQLContext {
  prisma: PrismaClient;
  userId: string;
}

export function buildContext(req: NextApiRequest): GraphQLContext {
  if (!req.auth?.sub) throw new Error('Unauthenticated');

  const sub = req.auth.sub as string; // narrow from string|() => string

  return {
    prisma,
    userId: sub.replace('auth0|', ''),
  };
}
