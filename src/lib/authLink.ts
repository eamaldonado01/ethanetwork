// ─── src/lib/authLink.ts ────────────────────────────────────
import { setContext } from '@apollo/client/link/context';
import { fetchAccessToken } from '@/lib/getToken';

export const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await fetchAccessToken(); // prod RT flow
    return { headers: { ...headers, Authorization: `Bearer ${token}` } };
  } catch {
    return { headers }; // fall back to cookie
  }
});
