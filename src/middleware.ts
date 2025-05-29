// ─── src/middleware.ts ────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';

const ALB_HEALTH_UA = 'ELB-HealthChecker'; // AWS ALB target-group probe UA

export function middleware(req: NextRequest) {
  /* 1️⃣ allow ALB health probes + /api/health ------------------------ */
  if (
    req.nextUrl.pathname === '/api/health' ||
    req.headers.get('user-agent')?.startsWith(ALB_HEALTH_UA)
  ) {
    return NextResponse.next();
  }

  /* 2️⃣ public assets & API routes never need a session --------------- */
  const { pathname, search } = req.nextUrl;
  if (
    pathname.startsWith('/api') || // /api/auth/**, /api/graphql, …
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  /* 3️⃣ all other pages need either an Auth0 session OR the guest cookie */
  const session = req.cookies.get('appSession')?.value;
  const guest = req.cookies.get('guestUser')?.value;

  if (!session && !guest) {
    // 🔑  No session → bounce to Auth0 Universal Login
    const returnTo = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(
      new URL(`/api/auth/login?returnTo=${returnTo}`, req.url),
    );
  }

  /* ✅ session present —or guest cookie present— request may proceed */
  return NextResponse.next();
}

/* Apply to everything except static assets / Next.js internals -------- */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
