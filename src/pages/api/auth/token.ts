import type { NextApiRequest, NextApiResponse } from 'next';
import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

type TokenResponse = { accessToken?: string };

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenResponse>,
) {
  /* This will:                                         *
   *  • exchange the code on first run, OR              *
   *  • transparently refresh the AT when expired       */
  const { accessToken } = await getAccessToken(req, res, {
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE!,
      scope: 'openid profile email offline_access',
    },
    refresh: true, // ← allow silent refresh using the RT
  });

  res.status(200).json({ accessToken });
});
