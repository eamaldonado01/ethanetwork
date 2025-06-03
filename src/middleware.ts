// ─── src/middleware.ts ────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';

const ALB_HEALTH_UA = 'ELB-HealthChecker'; // AWS ALB probe
const PREVIEW_BOTS =
  /(linkedinbot|twitterbot|facebookexternalhit|slackbot|discordbot|whatsapp)/i;

/* —— Minimal Open-Graph / Twitter-card markup ———————————————— */
const OG_HTML = /* html */ `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8" />
<title>ethanetwork – build in public</title>

<meta property="og:type"        content="website" />
<meta property="og:url"         content="https://ethanetwork.com" />
<meta property="og:title"       content="ethanetwork — social app demo" />
<meta property="og:description" content="Dark-mode first, guest log-ins,
mobile-friendly… built with Next 14, Prisma, Postgres + Auth0." />
<meta property="og:image"       content="https://ethanetwork.com/og.jpg" />

<meta name="twitter:card"       content="summary_large_image" />
<meta name="twitter:title"      content="ethanetwork — social app demo" />
<meta name="twitter:description" content="Dark-mode first, guest log-ins,
mobile-friendly… built with Next 14, Prisma, Postgres + Auth0." />
<meta name="twitter:image"      content="https://ethanetwork.com/og.jpg" />
</head><body></body></html>`;

/* ───────────────────────── middleware ─────────────────────────────── */
export function middleware(req: NextRequest) {
  const ua = req.headers.get('user-agent') ?? '';

  /* 1 ▸ ALB health checks --------------------------------------- */
  if (req.nextUrl.pathname === '/api/health' || ua.startsWith(ALB_HEALTH_UA)) {
    return NextResponse.next();
  }

  /* 2 ▸ Social-preview bots (GET **or HEAD**) -------------------- */
  if (PREVIEW_BOTS.test(ua)) {
    /* LinkedIn first sends a HEAD request; Twitter only sends GET.
       Reply with identical headers for both verbs.                */
    return new NextResponse(req.method === 'HEAD' ? null : OG_HTML, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  /* 3 ▸ Public assets & API don’t need a session ----------------- */
  const { pathname, search } = req.nextUrl;
  if (
    pathname.startsWith('/api') || // /api/auth/**, /api/graphql …
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  /* 4 ▸ All other pages need Auth0 or guest cookie -------------- */
  const session = req.cookies.get('appSession')?.value;
  const guest = req.cookies.get('guestUser')?.value;

  if (!session && !guest) {
    const returnTo = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(
      new URL(`/api/auth/login?returnTo=${returnTo}`, req.url),
    );
  }

  /* ✅ Auth / guest allowed through ------------------------------ */
  return NextResponse.next();
}

/* Apply to everything except static assets / Next internals -------- */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
