// ─── src/lib/getToken.ts ────────────────────────────────────────────
import 'client-only';

/** Small helper called by Apollo authLink on the client */
export async function fetchAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/token', { credentials: 'include' });
    if (!res.ok) return null;
    const { accessToken } = (await res.json()) as { accessToken?: string };
    return accessToken ?? null;
  } catch {
    return null;
  }
}
