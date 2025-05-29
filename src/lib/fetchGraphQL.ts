// src/lib/fetchGraphQL.ts
import { print } from 'graphql';
import type { DocumentNode } from 'graphql';

const REL = '/api/graphql';

/* -------------------------------------------------------------------------- */
/*  Decide the GraphQL endpoint                                               */
/* -------------------------------------------------------------------------- */
function endpoint(): string {
  /* ─────────────── Browser (client side) ─────────────── */
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${REL}`; // e.g. https://ethanetwork.com/api/graphql
  }

  /* ─────────────── Server (Node.js side) ─────────────── */
  // 1️⃣ Prefer the dedicated private URL if present.
  const internal = process.env.INTERNAL_GRAPHQL_URL;
  if (internal) return internal.replace(/\/$/, '');

  // 2️⃣ Fallback to the public site URL.
  const base =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === 'production'
      ? (() => {
          throw new Error(
            'One of INTERNAL_GRAPHQL_URL, SITE_URL or NEXT_PUBLIC_SITE_URL must be set in production',
          );
        })()
      : 'http://localhost:3000'); // ← dev convenience (never used in prod)

  return base.replace(/\/$/, '') + REL;
}

/* -------------------------------------------------------------------------- */
/*  Fetch helper                                                              */
/* -------------------------------------------------------------------------- */
export async function fetchGraphQL<TData, TVars>(
  doc: DocumentNode | string,
  variables: TVars,
): Promise<TData> {
  const headers: HeadersInit = { 'content-type': 'application/json' };

  /* Forward browser cookies during SSR/RSC -------------------------------- */
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers');
    const store = await cookies();
    const cookieHeader = store
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join('; ');
    if (cookieHeader) headers.cookie = cookieHeader;
  }

  const query = typeof doc === 'string' ? doc : print(doc);

  const res = await fetch(endpoint(), {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  /* Basic sanity-check ---------------------------------------------------- */
  const ctype = res.headers.get('content-type') ?? '';
  if (!ctype.includes('application/json')) {
    const text = await res.text();
    throw new Error(
      `GraphQL proxy returned non-JSON (${res.status}):\n${text.slice(0, 120)}…`,
    );
  }

  const json: { data?: TData; errors?: { message: string }[] } =
    await res.json();
  if (json.errors || !json.data) throw new Error('GraphQL error');
  return json.data;
}
