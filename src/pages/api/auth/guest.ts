import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

/**
 * Drops a lightweight “guestUser” cookie and bounces the browser
 * back to the app.  Any request that carries this cookie is treated
 * as the shared **guest** account (see middleware + buildContext).
 */
export default async function guestAuth(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  /* 30-day, non-HttpOnly so the front-end can inspect it if needed */
  const guestCookie = serialize('guestUser', '1', {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite:
      (process.env.AUTH0_COOKIE_SAME_SITE as 'lax' | 'none' | 'strict') ||
      'lax',
    secure: process.env.AUTH0_COOKIE_SECURE === 'true',
    httpOnly: false,
  });

  res.setHeader('Set-Cookie', guestCookie);

  /* Preserve deep-link if ?returnTo= provided */
  const dest =
    typeof req.query.returnTo === 'string' ? req.query.returnTo : '/';

  res.writeHead(302, { Location: dest });
  res.end();
}
