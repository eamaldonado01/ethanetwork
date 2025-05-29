import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Clears the `guestUser` cookie and redirects to Auth0 login, so
 * middleware will bounce the user back to the Universal Login screen.
 */
export default function guestLogout(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader('Set-Cookie', [
    // drop readable version
    'guestUser=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax',
    // drop legacy HttpOnly version
    'guestUser=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
  ]);
  res.writeHead(302, { Location: '/api/auth/login' });
  res.end();
}

/* no body parsing needed */
export const config = { api: { bodyParser: false } };
