import { getAccessToken } from '@auth0/nextjs-auth0';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { accessToken } = await getAccessToken(req, res);
    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    return res.status(200).json({ accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve access token' });
  }
}
