/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="jest" />
// 1️⃣  Mock Auth0 – always reply 401 without calling res.status()
jest.mock('@auth0/nextjs-auth0', () => ({
  withApiAuthRequired: () => (_req: any, res: any) => {
    res.statusCode = 401;
    res.end();
  },
  getSession: () => null,
}));

// 2️⃣  Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    post: { findMany: () => [] },
  })),
}));

// 3️⃣  Spin up the handler
import request from 'supertest';
import handler from '@/pages/api/graphql';
import { testServer } from './utils/server';

describe('Feed query', () => {
  it('401 when no token', async () => {
    const srv = testServer(handler).listen();
    const res = await request(srv)
      .post('/api/graphql')
      .send({ query: '{ feed(first:1){ edges{ cursor } } }' });
    expect(res.statusCode).toBe(401);
    srv.close();
  }, 7000);
});
