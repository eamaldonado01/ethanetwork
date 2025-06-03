// ─── src/middleware.ts ────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';

const ALB_HEALTH_UA = 'ELB-HealthChecker';

/* common social / chat crawlers – case-insensitive */
const PREVIEW_BOTS =
  /(linkedinbot|twitterbot|facebookexternalhit|slackbot|discordbot|whatsapp)/i;

/* —— single static preview page (edit as needed) ——————————— */
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

  /* 1 ▸ AWS ALB health checks ----------------------------------- */
  if (pathname === '/api/health' || ua.startsWith(ALB_HEALTH_UA)) {
    return NextResponse.next();
  }

  /* 2 ▸ If the caller is a known crawler → serve OG page -------- */
  if (PREVIEW_BOTS.test(ua)) {
    return new NextResponse(req.method === 'HEAD' ? null : OG_HTML, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  /* 3 ▸ *Any* unauthenticated visit to “/” should see OG too ----- */
  const session = req.cookies.get('appSession')?.value;
  const guest = req.cookies.get('guestUser')?.value;

  if (
    !session &&
    !guest &&
    pathname === '/' &&
    (req.method === 'GET' || req.method === 'HEAD')
  ) {
    return new NextResponse(req.method === 'HEAD' ? null : OG_HTML, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  /* 4 ▸ Public assets & API don’t need a session ---------------- */
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  /* 5 ▸ Everyone else must be logged in (Auth0 or guest cookie) - */
  if (!session && !guest) {
    const returnTo = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(
      new URL(`/api/auth/login?returnTo=${returnTo}`, req.url),
    );
  }

  /* ✅ authenticated traffic proceeds normally ------------------ */
  return NextResponse.next();
}

/* Apply everywhere except static assets / Next internals -------- */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
