// src/lib/fetchGraphQL.ts
import { print } from 'graphql';
import type { DocumentNode } from 'graphql';

const PATH = '/api/graphql';

/* Decide the endpoint exactly once */
function endpoint(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${PATH}`;
  }

  /* Prefer the task ENI if we have it (ECS) */
  if (process.env.TASK_ENI_IP)
    return `http://${process.env.TASK_ENI_IP}:${process.env.PORT ?? '3000'}${PATH}`;

  /* Fallbacks identical to api.ts */
  if (process.env.INTERNAL_GRAPHQL_URL)
    return process.env.INTERNAL_GRAPHQL_URL.replace(/\/$/, '');

  const port = process.env.PORT ?? '3000';
  const host = process.env.HOST ?? '127.0.0.1';
  return `http://${host}:${port}${PATH}`;
}

/* -------------------------------------------------------------------------- */
/*  Fetch helper                                                              */
/* -------------------------------------------------------------------------- */
export async function fetchGraphQL<TData, TVars>(
  doc: DocumentNode | string,
  variables: TVars,
): Promise<TData> {
  const headers: HeadersInit = { 'content-type': 'application/json' };

  /* Forward cookies during SSR/RSC */
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
