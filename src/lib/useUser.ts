// src/lib/useUser.ts
import useSWR from 'swr';

export interface SessionUser {
  sub: string;
  name?: string;
  email?: string;
}

/**
 * Fetcher for SWR: takes a URL string, returns SessionUser or null.
 */
async function fetcher(url: string): Promise<SessionUser | null> {
  const res = await fetch(url, {
    credentials: 'include', // send the Auth0 session cookie
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

/**
 * Hook to load the current session user.
 */
export function useUser() {
  const { data, error, isLoading } = useSWR<SessionUser | null, Error>(
    '/api/auth/me',
    fetcher,
  );
  return {
    user: data,
    error,
    isLoading,
  };
}
