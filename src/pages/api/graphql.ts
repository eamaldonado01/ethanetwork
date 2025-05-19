// src/pages/api/graphql.ts
import { ApolloServer, gql } from 'apollo-server-micro';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import fs from 'fs';
import path from 'path';

import { resolvers } from '@/graphql/resolvers';
import { buildContext } from '@/lib/context';

// Load your SDL from schema.graphql
const sdl = fs.readFileSync(
  path.join(process.cwd(), 'src', 'graphql', 'schema.graphql'),
  'utf8',
);
const typeDefs = gql(sdl);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Now context gets both req and res so we can call getSession()
  context: async ({
    req,
    res,
  }: {
    req: NextApiRequest;
    res: NextApiResponse;
  }) => buildContext(req, res),
});

export const config = {
  api: {
    bodyParser: false,
  },
};

let started = false;

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!started) {
    await server.start();
    started = true;
  }
  const graphqlHandler = server.createHandler({ path: '/api/graphql' });
  return graphqlHandler(req, res);
});
