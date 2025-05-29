/**
 * Public user-profile route  –  /u/<username>
 * (Runs as an RSC, so we can call Prisma / Auth0 directly.)
 */
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

import { getSession } from '@auth0/nextjs-auth0';
interface AuthSession {
  user?: { sub?: string };
}

import ProfileClient from '@/components/ProfileClient';
import { getPublicUser } from '@/lib/users';
import type { User } from '@/generated/graphql';

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;

  /* ── viewer session (no req / res inside an RSC) ─────────────── */
  const session: AuthSession | null =
    (await (getSession as () => Promise<AuthSession>)()) ?? null;

  /* ── fall back to lightweight guest cookie when no Auth0 session ─ */
  const isGuest = !session && cookies().get('guestUser')?.value === '1';
  const viewerId = session?.user?.sub ?? (isGuest ? 'guest' : null);

  /* ── single Prisma round-trip with viewer context ─────────────── */
  const user = await getPublicUser(username, viewerId);
  if (!user) notFound();

  return (
    <ProfileClient initialUser={user as unknown as User} editable={false} />
  );
}
