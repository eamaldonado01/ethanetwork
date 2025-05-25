// src/pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res);
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  return res.status(200).json(session.user);
}
