// ─── src/app/page.tsx ──────────────────────────────────────────────
import { redirect } from 'next/navigation';

/**
 * Redirect bare “/” requests to the proper home feed.
 * Running on the server – no client JS is shipped.
 */
export default function Root() {
  redirect('/home');
}
