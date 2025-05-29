import prisma from './prisma';

/**
 * Ensure a User row exists and has a unique, non-empty `username`.
 * Call once right after Auth0 login / callback.
 */
export async function ensureUser(auth0User: {
  sub: string;
  email: string;
  nickname?: string | null;
}) {
  const base = (
    auth0User.nickname ||
    auth0User.email.split('@')[0] ||
    auth0User.sub
  ).toLowerCase();

  /* generate unique username */
  let candidate = base;
  let i = 1;
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${base}${i++}`.toLowerCase();
  }

  await prisma.user.upsert({
    where: { id: auth0User.sub },
    create: {
      id: auth0User.sub,
      email: auth0User.email,
      username: candidate,
      name: auth0User.nickname || candidate,
    },
    update: {}, // no changes on repeat login
  });
}
