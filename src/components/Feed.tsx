// ─── src/components/Feed.tsx ───────────────────────────────────────────
import PostCard from './PostCard';
import type { PostFragmentFragment as Post } from '@/generated/graphql';

export default function Feed({ posts }: { posts: Post[] }) {
  if (!posts.length) return <p>No posts yet.</p>;

  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}
