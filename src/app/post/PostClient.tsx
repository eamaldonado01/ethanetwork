// src/app/post/PostClient.tsx
'use client';

import PostComposer from '@/components/PostComposer';

export default function PostClient() {
  return (
    <section className="mx-auto w-full max-w-2xl">
      <PostComposer />
    </section>
  );
}
