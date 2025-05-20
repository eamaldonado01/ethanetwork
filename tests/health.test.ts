/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * tests/health.test.ts
 *
 * – Completely unit-tests the /api/auth/me route.
 * – Mocks Auth0 so we don't need its real internals.
 * – Uses a hand-rolled res object that implements .status().json().
 */
import type { NextApiRequest, NextApiResponse } from 'next';

// ── 1) Mock @auth0/nextjs-auth0 so getSession() always returns null ──────────
jest.mock('@auth0/nextjs-auth0', () => ({
  getSession: () => null,
}));

// ── 2) Import the handler AFTER the mock is in place ─────────────────────────
import handler from '@/pages/api/auth/me';

// ── 3) Minimal helpers ───────────────────────────────────────────────────────
function mockRes(): NextApiResponse & { payload: any; statusCode: number } {
  const res: any = {};
  res.statusCode = 0;
  res.payload = null;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: unknown) => {
    res.payload = data;
    return res;
  };
  return res as NextApiResponse & { payload: any; statusCode: number };
}

// ── 4) The actual smoke test ─────────────────────────────────────────────────
describe('auth health-check', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = {} as NextApiRequest;
    const res = mockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.payload).toEqual({ error: 'unauthenticated' });
  });
});
