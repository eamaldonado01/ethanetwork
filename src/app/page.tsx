'use client';
import { useFeedQuery } from '@/generated/graphql';
import { PostCard } from '@/components/PostCard';
import { PostComposer } from '@/components/PostComposer';

export default function Home() {
  const { data, loading, fetchMore } = useFeedQuery({
    variables: { first: 10 },
    notifyOnNetworkStatusChange: true,
  });

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
                after: data.feed.edges[data.feed.edges.length - 1]!.cursor,
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
