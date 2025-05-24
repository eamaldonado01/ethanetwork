// src/lib/apolloClient.ts
'use client';

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { fetchAccessToken } from '@/lib/getToken';

// ── 1️⃣  plain HTTP link that always sends the Auth0 cookie ──────────
const httpLink = new HttpLink({
  uri: '/api/graphql',
  credentials: 'include', // ← send the session cookie
});

// ── 2️⃣  async auth link that injects/refreshes the Bearer token ─────
const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await fetchAccessToken(); // GET /api/auth/token
    return {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    };
  } catch {
    // token fetch failed – proceed with just the cookie
    return { headers };
  }
});

// ── 3️⃣  optional logging for auth/network errors ───────────────────
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, extensions }) => {
      if (extensions?.code === 'UNAUTHENTICATED') {
        console.warn('[GraphQL unauthenticated]', message);
      }
    });
  if (networkError) console.error('[Network error]', networkError);
});

// ── 4️⃣  final client instance ───────────────────────────────────────
export const client = new ApolloClient({
  link: from([errorLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache(),
});
