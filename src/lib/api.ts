// ─── src/lib/api.ts ──────────────────────────────────────────────
import { print } from 'graphql';
import type { DocumentNode } from 'graphql';
import gqlTag from 'graphql-tag';

/* ────────────────────────────────────────────────────────────────
 * Decide the GraphQL endpoint (same logic everywhere)
 * ────────────────────────────────────────────────────────────────*/
function graphqlURL(): string {
  /* browser – always talk to the current origin */
  if (typeof window !== 'undefined') return '/api/graphql';

  /* server side */
  if (process.env.INTERNAL_GRAPHQL_URL)
    return process.env.INTERNAL_GRAPHQL_URL.replace(/\/$/, '');

  const base =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://127.0.0.1:3000'; // dev / ultimate fallback

  return base.replace(/\/$/, '') + '/api/graphql';
}

/* ------------------------------------------------------------------ *
 * 1. Server-side execute helper (`gql`)                               *
 * ------------------------------------------------------------------ */
export async function gql<
  TData = unknown,
  TVars extends Record<string, unknown> = Record<string, never>,
>(
  doc: DocumentNode,
  variables?: TVars,
  init: RequestInit = {},
): Promise<TData> {
  /* base headers */
  let headers: HeadersInit = {
    'content-type': 'application/json',
    ...init.headers,
  };

  /* forward Cookie header when running on the server */
  if (typeof window === 'undefined') {
    const { headers: reqHeaders } = await import('next/headers');
    const raw = (await reqHeaders()).get('cookie');
    if (raw) headers = { ...headers, cookie: raw };
  }

  const res = await fetch(graphqlURL(), {
    method: 'POST',
    ...init,
    headers,
    body: JSON.stringify({ query: print(doc), variables }),
    cache: 'no-store',
  });

  const json: { data?: TData; errors?: { message: string }[] } =
    await res.json();

  if (!json.data) {
    console.error(
      '\n⇢ GraphQL query failed',
      '\n  doc       :',
      print(doc).split('\n')[0] + '…',
      '\n  variables :',
      variables,
      '\n  errors    :',
      json.errors,
    );
    throw new Error(json.errors?.[0]?.message ?? 'GraphQL error');
  }
  return json.data;
}

/* ------------------------------------------------------------------ *
 * 2. Browser-side helper (CSR)                                        *
 * ------------------------------------------------------------------ */
export async function fetchGraphQL<
  TData = unknown,
  TVars extends Record<string, unknown> = Record<string, never>,
>(query: string, variables?: TVars, init: RequestInit = {}): Promise<TData> {
  const res = await fetch('/api/graphql', {
    method: 'POST',
    ...init,
    headers: { 'content-type': 'application/json', ...init.headers },
    body: JSON.stringify({ query, variables }),
  });

  const json: { data?: TData; errors?: { message: string }[] } =
    await res.json();

  if (!json.data) throw new Error(json.errors?.[0]?.message ?? 'GraphQL error');
  return json.data;
}

/* ------------------------------------------------------------------ *
 * 3. Convenience helpers (unchanged)                                  *
 * ------------------------------------------------------------------ */

/* —— Post with comments —————————————————————————— */
const POST_WITH_COMMENTS = gqlTag`
  query PostWithComments($id: ID!) {
    post(id: $id) {
      id
      content
      createdAt
      imageUrl
      likeCount
      commentCount
      viewerHasLiked
      author { id username name imageUrl }
      comments {
        id
        body
        createdAt
        author { id username name imageUrl }
      }
    }
  }
`;

export async function getPostWithComments(postId: string) {
  const { post } = await gql<{ post: unknown }, { id: string }>(
    POST_WITH_COMMENTS,
    { id: postId },
  );

  if (!post || typeof post !== 'object' || post === null) return null;

  const p = post as { comments?: unknown[] } & Record<string, unknown>;

  return { post: p, comments: p.comments ?? [] };
}

/* —— User search ———————————————————————————— */
const SEARCH_USERS = gqlTag`
  query SearchUsers($search: String!) {
    users(search: $search, first: 20) {
      id
      username
      name
      imageUrl
    }
  }
`;

export async function searchUsers(search: string) {
  const { users } = await gql<
    { users: Array<Record<string, unknown>> },
    { search: string }
  >(SEARCH_USERS, { search });

  return users;
}
