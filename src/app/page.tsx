// src/app/page.tsx
'use client';

import { useCallback } from 'react';
import { useFeedQuery } from '@/generated/graphql';
import { useSocket } from '@/lib/useSocket';
import { CHANNELS, type Broadcast } from '@/lib/redis';
import { PostCard } from '@/components/PostCard';
import { PostComposer } from '@/components/PostComposer';

export default function Home() {
  const { data, loading, fetchMore, refetch } = useFeedQuery({
    variables: { first: 10 },
    notifyOnNetworkStatusChange: true,
  });

  const handleEvent = useCallback(
    (e: Broadcast) => {
      if (e.type === CHANNELS.NEW_POST || e.type === CHANNELS.LIKE_UPDATE) {
        refetch();
      }
    },
    [refetch],
  );

  useSocket(handleEvent);

  if (loading && !data) return <p className="p-4">Loading…</p>;

  return (
    <main className="max-w-xl mx-auto p-4 space-y-4">
      <PostComposer />
      {data?.feed.edges.map(({ node }) => (
        <PostCard key={node.id} post={node} />
      ))}
      {data?.feed.hasNextPage && (
        <button
          onClick={() =>
            fetchMore({
              variables: {
                after: data.feed.edges.at(-1)!.cursor,
                first: 10,
              },
            })
          }
          className="w-full py-2 bg-gray-100 rounded"
        >
          Load more
        </button>
      )}
    </main>
  );
}
