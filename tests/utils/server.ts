/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServer, IncomingMessage, ServerResponse } from 'http';
import type { NextApiHandler } from 'next';

/**
 * Wrap a Next.js API handler in a plain Node HTTP server
 * so Supertest can exercise it.
 */
export function testServer(handler: NextApiHandler) {
  return createServer((req: IncomingMessage, res: ServerResponse) =>
    handler(req as any, res as any),
  );
}
