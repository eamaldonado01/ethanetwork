import { NextRequest, NextResponse } from 'next/server';

const ALB_HEALTH_UA = 'ELB-HealthChecker';

// Preview‑crawler user‑agents *only* (no regular browsers)
const PREVIEW_BOTS =
  /(linkedinbot|libot|twitterbot|facebookexternalhit|slackbot|discordbot|whatsapp|vkshare|telegrambot)/i;

/* ----------  Static OG response sent only to social crawlers ---------- */
const OG_HTML = `<!doctype html><html lang="en"><head>
<meta charset="utf-8">
<title>ethanetwork — social app demo</title>

<meta property="og:type"        content="website">
<meta property="og:url"         content="https://ethanetwork.com">
<meta property="og:title"       content="ethanetwork — social app demo">
<meta property="og:description" content="Dark‑mode first, guest log‑ins, mobile‑friendly… built with Next 14, Prisma, Postgres & Auth0.">
<meta property="og:image"       content="https://ethanetwork.com/icon.png">

<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="ethanetwork — social app demo">
<meta name="twitter:description" content="Dark‑mode first, guest log‑ins, mobile‑friendly… built with Next 14, Prisma, Postgres & Auth0.">
<meta name="twitter:image"       content="https://ethanetwork.com/icon.png">
</head><body></body></html>`;

/* --------------------------------------------------------------------- */
export function middleware(req: NextRequest) {
  const ua = req.headers.get('user-agent') ?? '';
  const isPreviewBot = PREVIEW_BOTS.test(ua);
  const { pathname, search } = req.nextUrl;
  const isAuthenticated =
    req.cookies.has('appSession') || req.cookies.has('guestUser');

  /* 0 ▸ Social crawlers always get the OG stub */
  if (isPreviewBot && (req.method === 'GET' || req.method === 'HEAD')) {
    return new NextResponse(req.method === 'HEAD' ? null : OG_HTML, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'x-robots-tag': 'all',
      },
    });
  }

  /* 1 ▸ ALB health checks */
  if (pathname === '/api/health' || ua.startsWith(ALB_HEALTH_UA)) {
    return NextResponse.next();
  }

  /* 2 ▸ Public assets & API bypass auth */
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt' ||
    /\.(png|jpe?g|svg|webp|ico)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  /* 3 ▸ Redirect unauthenticated traffic to login */
  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(
      new URL(`/api/auth/login?returnTo=${returnTo}`, req.url),
    );
  }

  /* ✅ Authenticated traffic */
  return NextResponse.next();
}

export const config = { matcher: ['/:path*'] };
