'use client';

import { useEffect, useState } from 'react';
import PostCard from './PostCard';
import { gql } from '@/lib/api';

import {
  FeedDocument,
  PostsByLikesDocument,
  type FeedQuery,
  type PostsByLikesQuery,
  type PostFragmentFragment as Post,
} from '@/generated/graphql';

export default function PostFeed({ mode }: { mode: 'recent' | 'liked' }) {
  const [posts, setPosts] = useState<Post[]>([]);

  /* load list on mount / mode change ----------------------------------- */
  useEffect(() => {
    (mode === 'recent' ? getRecent : getMostLiked)().then(setPosts);
  }, [mode]);

  /* callback from PostCard after deletion ------------------------------ */
  const handleDeleted = (id: string) =>
    setPosts((prev) => prev.filter((p) => p.id !== id));

  return (
    <section className="space-y-6">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} onDeleted={handleDeleted} />
      ))}
    </section>
  );
}

/* ───────────────────────── helpers ───────────────────────── */

const edgesToNodes = <T,>(edges: { node: T }[]) => edges.map((e) => e.node);

async function getRecent(): Promise<Post[]> {
  const { feed } = await gql<FeedQuery, { first: number }>(FeedDocument, {
    first: 20,
  });
  return edgesToNodes<Post>(feed.edges);
}

async function getMostLiked(): Promise<Post[]> {
  const { postsByLikes } = await gql<PostsByLikesQuery, { first: number }>(
    PostsByLikesDocument,
    { first: 20 },
  );
  return postsByLikes;
}
