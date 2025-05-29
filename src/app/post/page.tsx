// ─── src/app/post/page.tsx ──────────────────────────────────────
export const dynamic = 'force-dynamic'; // disable static prerender

import PostClient from './PostClient';

export default function CreatePostPage() {
  return (
    <main className="mx-auto max-w-2xl px-4">
      <PostClient />
    </main>
  );
}
