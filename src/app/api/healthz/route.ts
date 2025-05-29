// app/api/healthz/route.ts

// – optional; remove if ever want edge runtime
export const runtime = 'nodejs'; // valid literal for Next 14

export const revalidate = 0; // disable ISR caching

export async function GET() {
  return new Response('OK', { status: 200 });
}
