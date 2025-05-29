// ─── src/pages/api/graphql.ts ──────────────────────────────────────────
import { ApolloServer, gql } from 'apollo-server-micro';
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

import { resolvers } from '@/graphql/resolvers';
import { buildContext } from '@/lib/context';

/* 1️⃣  SDL ------------------------------------------------------------------ */
const sdl = fs.readFileSync(
  path.join(process.cwd(), 'src', 'graphql', 'schema.graphql'),
  'utf8',
);
const typeDefs = gql(sdl);

/* 2️⃣  Single Apollo instance ---------------------------------------------- */
const apollo = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({
    req,
    res,
  }: {
    req: NextApiRequest;
    res: NextApiResponse;
  }) => buildContext(req, res),
});

/* 3️⃣  Lazy-start guard to avoid race conditions --------------------------- */
let startPromise: Promise<void> | null = null;
let handler: ReturnType<typeof apollo.createHandler> | null = null;

async function ensureStarted() {
  if (!startPromise) {
    startPromise = apollo.start().then(() => {
      handler = apollo.createHandler({ path: '/api/graphql' });
    });
  }
  await startPromise;
}

/* 4️⃣  Next.js API route ---------------------------------------------------- */
export const config = { api: { bodyParser: false } };

export default async function graphqlRoute(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await ensureStarted(); // first-call initialisation
  return handler!(req, res); // safe after ensureStarted()
}
