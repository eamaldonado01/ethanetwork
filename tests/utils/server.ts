/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="jest" />
import { createServer, IncomingMessage, ServerResponse } from 'http';
import type { NextApiHandler } from 'next';

export function testServer(handler: NextApiHandler) {
  return createServer((req: IncomingMessage, res: ServerResponse) => {
    // add Express-like helpers so Supertest works
    (res as any).status = (code: number) => {
      res.statusCode = code;
      return res;
    };
    (res as any).json = (payload: unknown) => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(payload));
      return res;
    };
    handler(req as any, res as any);
  });
}
