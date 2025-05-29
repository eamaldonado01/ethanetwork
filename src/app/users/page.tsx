// ─── src/app/users/page.tsx ──────────────────────────────────────
export const dynamic = 'force-dynamic'; // SSR only – disables prerender

import UsersClient from './UsersClient'; // ← client component

export default function UsersPage() {
  return <UsersClient />;
}
