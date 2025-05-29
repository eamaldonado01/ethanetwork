// ────────────────────────────────
// src/pages/api/auth/[...auth0].ts
// ────────────────────────────────
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from '@auth0/nextjs-auth0';
import {
  handleAuth,
  handleLogin,
  handleCallback,
  handleLogout,
} from '@auth0/nextjs-auth0';
import { PrismaClient } from '@prisma/client';

/* ───────────────────────── shared Prisma (hot-reload safe) ──────────────────────── */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/* ───────────────────────── helper: expire Auth0 session cookie ──────────────────── */
function expireAppSession(res: NextApiResponse) {
  const { hostname } = new URL(process.env.AUTH0_BASE_URL!);
  res.setHeader(
    'Set-Cookie',
    `appSession=; Path=/; Domain=${hostname}; Max-Age=0; HttpOnly; SameSite=Lax; Secure`,
  );
}

/* ───────────────────────── helper: ensure unique username ───────────────────────── */
async function uniqueUsername(base: string): Promise<string> {
  let candidate = base.toLowerCase();
  let n = 1;
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${base}${n++}`.toLowerCase();
  }
  return candidate;
}

/* ───────────────────────── Auth0 route handlers ─────────────────────────────────── */
export default handleAuth({
  /* LOGIN */
  login: (req: NextApiRequest, res: NextApiResponse) =>
    handleLogin(req, res, {
      authorizationParams: {
        audience: process.env.AUTH0_AUDIENCE,
        scope: 'openid profile email offline_access',
      },
    }),

  /* CALLBACK – create or update user row */
  callback: (req: NextApiRequest, res: NextApiResponse) =>
    handleCallback(req, res, {
      afterCallback: async (
        _req: NextApiRequest,
        _res: NextApiResponse,
        session: Session,
      ) => {
        const { sub, name, email, picture, nickname } = session.user;

        // derive a unique username
        const base = (nickname || email?.split('@')[0] || sub).toLowerCase();
        const username = await uniqueUsername(base);

        await prisma.user.upsert({
          where: { id: sub },
          update: { name, email, imageUrl: picture },
          create: {
            id: sub,
            username,
            name,
            email,
            imageUrl: picture,
          },
        });

        return session;
      },
    }),

  /* LOGOUT – clear cookie then federated logout */
  logout: async (req: NextApiRequest, res: NextApiResponse) => {
    expireAppSession(res);
    await handleLogout(req, res, { returnTo: process.env.AUTH0_BASE_URL });
  },
});
