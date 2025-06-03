// ─── src/middleware.ts ────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';

const ALB_HEALTH_UA = 'ELB-HealthChecker';
const PREVIEW_BOTS =
  /(linkedinbot|twitterbot|facebookexternalhit|slackbot|discordbot|whatsapp)/i;

/**
 * Treat the marketing landing page as “root”.
 * Handles:
 *   – ""  (bare‑host requests that Next maps to an empty pathname)
 *   – "/"  (explicit trailing slash)
 *   – "/en" or "/en-US" (i18n default‑locale prefix with optional region)
 */
const isLanding = (path: string) => {
  if (path === '' || path === '/') return true;
  return /^\/(?:[a-z]{2}(?:-[A-Z]{2})?)\/?$/.test(path);
};

/* —­­ single static preview page — */
const OG_HTML = /* html */ `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8" />
<title>ethanetwork – build in public</title>

<meta property="og:type"        content="website" />
<meta property="og:url"         content="https://ethanetwork.com" />
<meta property="og:title"       content="ethanetwork — social app demo" />
<meta property="og:description"
      content="Dark-mode first, guest log-ins, mobile-friendly… built with Next 14, Prisma, Postgres & Auth0." />
<meta property="og:image"       content="https://ethanetwork.com/og.jpg" />

<meta name="twitter:card"       content="summary_large_image" />
<meta name="twitter:title"      content="ethanetwork — social app demo" />
<meta name="twitter:description"
      content="Dark-mode first, guest log-ins, mobile-friendly… built with Next 14, Prisma, Postgres & Auth0." />
<meta name="twitter:image"      content="https://ethanetwork.com/og.jpg" />
</head><body></body></html>`;

/* ─────────────────────────────────────────────────────────────── */
export function middleware(req: NextRequest) {
  const ua = req.headers.get('user-agent') ?? '';
  const { pathname, search } = req.nextUrl;
  const session = req.cookies.get('appSession')?.value;
  const guest = req.cookies.get('guestUser')?.value;
  const unauth = !session && !guest;
  const headOrGet = req.method === 'HEAD' || req.method === 'GET';

  /* 1 ▸ ALB health checks --------------------------------------------- */
  if (pathname === '/api/health' || ua.startsWith(ALB_HEALTH_UA)) {
    return NextResponse.next();
  }

  /* 2 ▸ Public assets / API / robots.txt bypass auth ------------------- */
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt'
  ) {
    return NextResponse.next();
  }

  /* 3 ▸ Landing page gets OG when unauth ------------------------------ */
  if (isLanding(pathname) && unauth && headOrGet) {
    return new NextResponse(req.method === 'HEAD' ? null : OG_HTML, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  /* 4 ▸ Social preview bots get OG anywhere --------------------------- */
  if (PREVIEW_BOTS.test(ua)) {
    return new NextResponse(req.method === 'HEAD' ? null : OG_HTML, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  /* 5 ▸ Everything else requires auth or guest ------------------------ */
  if (unauth) {
    const returnTo = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(
      new URL(`/api/auth/login?returnTo=${returnTo}`, req.url),
    );
  }

  /* ✅ Authenticated traffic proceeds normally ------------------------ */
  return NextResponse.next();
}

/* Apply middleware everywhere ---------------------------------------- */
export const config = {
  matcher: ['/:path*'],
};
