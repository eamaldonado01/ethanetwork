// ─── src/lib/apolloClient.ts ───────────────────────────────────────────
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

/**
 * Decide where the GraphQL API lives.
 *
 * •  In the **browser** we always talk to the current origin:
 *       →   /api/graphql   (= https://ethanetwork.com/api/graphql in prod)
 *
 * •  On the **server** (SSR / RSC / API routes) we prefer a private,
 *    container-internal address that never leaves the VPC:
 *       INTERNAL_GRAPHQL_URL =  http://127.0.0.1:3000/api/graphql
 *
 *   Fallbacks, in order:
 *       SITE_URL  →  NEXT_PUBLIC_SITE_URL  →  http://localhost:3000  (dev only)
 */
function graphqlURL(): string {
  /* ——— client side ——— */
  if (typeof window !== 'undefined') return '/api/graphql';

  /* ——— server side ——— */
  if (process.env.INTERNAL_GRAPHQL_URL)
    return process.env.INTERNAL_GRAPHQL_URL.replace(/\/$/, '');

  const pub =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === 'production'
      ? (() => {
          throw new Error(
            'Set INTERNAL_GRAPHQL_URL **or** SITE_URL / NEXT_PUBLIC_SITE_URL in production',
          );
        })()
      : 'http://localhost:3000');

  return pub.replace(/\/$/, '') + '/api/graphql';
}

const httpLink = new HttpLink({
  uri: graphqlURL(),
  credentials: 'same-origin',
});

export const client = new ApolloClient({
  ssrMode: typeof window === 'undefined',
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV !== 'production',
});
