import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import type { JwtPayload } from 'jsonwebtoken';
import type { Request, Response, NextFunction, RequestHandler } from 'express';

// Extend global types
declare global {
  // eslint-disable-next-line no-var
  var __APOLLO_HANDLER__:
    | ((req: NextApiRequest, res: NextApiResponse) => Promise<void>)
    | undefined;
  // eslint-disable-next-line no-var
  var __APOLLO_SERVER__: ApolloServer | undefined;
}

interface CustomContext {
  auth?: JwtPayload | string;
}

// Type-safe Express middleware adapter for Next.js
function adaptExpressMiddleware(
  middleware: RequestHandler,
): (req: NextApiRequest, res: NextApiResponse, next: () => void) => void {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    middleware(
      req as unknown as Request,
      res as unknown as Response,
      next as unknown as NextFunction,
    );
  };
}

// Schema
const typeDefs = `#graphql
  type Query {
    hello: String!
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello from Apollo Server!',
  },
};

// Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) =>
    req.headers['x-forwarded-for']?.toString().split(',')[0] ||
    req.socket?.remoteAddress ||
    'unknown',
});

// Auth0 middleware
const authCheck = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://YOUR_DOMAIN/.well-known/jwks.json', // Replace this
  }),
  algorithms: ['RS256'],
  credentialsRequired: false,
});

// CORS config
const corsMiddleware = cors({
  origin: 'https://studio.apollographql.com',
  credentials: true,
});

async function createHandler() {
  if (global.__APOLLO_HANDLER__) return global.__APOLLO_HANDLER__;

  if (!global.__APOLLO_SERVER__) {
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();
    global.__APOLLO_SERVER__ = server;
  }

  const router = createRouter<NextApiRequest, NextApiResponse>();
  const isDev = process.env.NODE_ENV !== 'production';

  router.use(corsMiddleware);

  router.use(
    helmet({
      contentSecurityPolicy: isDev
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                'https://embeddable-sandbox.cdn.apollographql.com',
                'https://apollo-server-landing-page.cdn.apollographql.com',
              ],
              frameSrc: [
                "'self'",
                'https://sandbox.embed.apollographql.com',
                'https://studio.apollographql.com',
              ],
              frameAncestors: ["'self'", 'https://studio.apollographql.com'],
              connectSrc: [
                "'self'",
                'https://sandbox.embed.apollographql.com',
                'https://studio.apollographql.com',
              ],
              imgSrc: [
                "'self'",
                'https://apollo-server-landing-page.cdn.apollographql.com',
              ],
              manifestSrc: [
                "'self'",
                'https://apollo-server-landing-page.cdn.apollographql.com',
              ],
            },
          }
        : undefined,
    }),
  );

  // Type-safe middleware adapters
  router.use(adaptExpressMiddleware(limiter));
  router.use(adaptExpressMiddleware(authCheck));

  router.all(
    startServerAndCreateNextHandler(global.__APOLLO_SERVER__!, {
      context: async (req): Promise<CustomContext> => ({
        auth: req.auth,
      }),
    }),
  );

  global.__APOLLO_HANDLER__ = router.handler();
  return global.__APOLLO_HANDLER__;
}

export default async function handlerEntry(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const handler = await createHandler();
  return handler(req, res);
}
