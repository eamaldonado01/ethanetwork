// src/pages/api/auth/token.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

type TokenResponse = { accessToken?: string };

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenResponse>,
) {
  // This will do the code-exchange under the hood (if needed)
  // and surface us a real Auth0 JWT whose `aud` matches AUTH0_AUDIENCE.
  const { accessToken } = await getAccessToken(req, res, {
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE!,
      scope: 'openid profile email',
    },
  });

  res.status(200).json({ accessToken });
});
