// ─── src/middleware.ts ────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';

const ALB_HEALTH_UA = 'ELB-HealthChecker'; // AWS ALB checks
const CRAWLER_UA =
  /(linkedinbot|twitterbot|facebookexternalhit|slackbot|discordbot|whatsapp)/i;
/*  add / remove bots as you wish ↑                                               */

export function middleware(req: NextRequest) {
  /* 1️⃣  allow health probes -------------------------------------------------- */
  if (
    req.nextUrl.pathname === '/api/health' ||
    req.headers.get('user-agent')?.startsWith(ALB_HEALTH_UA)
  ) {
    return NextResponse.next();
  }

  /* 2️⃣  let preview-bots fetch the real page -------------------------------- */
  if (CRAWLER_UA.test(req.headers.get('user-agent') ?? '')) {
    return NextResponse.next(); // ← bypass Auth0
  }

  /* 3️⃣  public assets & API never need a session ---------------------------- */
  const { pathname, search } = req.nextUrl;
  if (
    pathname.startsWith('/api') || // /api/auth/**, /api/graphql …
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  /* 4️⃣  everything else needs Auth0 or guest cookie ------------------------- */
  const session = req.cookies.get('appSession')?.value;
  const guest = req.cookies.get('guestUser')?.value;

  if (!session && !guest) {
    const returnTo = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(
      new URL(`/api/auth/login?returnTo=${returnTo}`, req.url),
    );
  }

  return NextResponse.next(); // ✅ allowed through
}

/*  apply to everything except static assets / Next internals ---------------- */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
