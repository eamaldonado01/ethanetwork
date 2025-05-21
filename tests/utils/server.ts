/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServer } from 'http';
import handler from '@/pages/api/graphql';

export function testServer() {
  return createServer((req, res) => handler(req as any, res as any));
}
