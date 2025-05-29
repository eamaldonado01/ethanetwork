// src/lib/useUser.ts
import useSWR from 'swr';

export interface SessionUser {
  sub: string;
  name?: string;
  email?: string;
  /* extra fields most IdPs provide */
  picture?: string;
  image?: string;
}

/** plain fetcher that returns the parsed user or null */
async function fetcher(url: string): Promise<SessionUser | null> {
  const res = await fetch(url, { credentials: 'include' });
  return res.ok ? res.json() : null;
}

export function useUser() {
  const { data, error, isLoading } = useSWR<SessionUser | null, Error>(
    '/api/auth/me',
    fetcher,
  );
  return { user: data ?? undefined, error, isLoading };
}
