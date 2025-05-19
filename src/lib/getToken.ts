// src/lib/getToken.ts
export async function fetchAccessToken(): Promise<string> {
  const res = await fetch('/api/auth/token', {
    credentials: 'include', // ← send the Auth0 session cookie
  });
  if (!res.ok) throw new Error('Token fetch failed');
  const { accessToken } = (await res.json()) as { accessToken?: string };
  if (!accessToken) throw new Error('No token returned');
  return accessToken;
}
