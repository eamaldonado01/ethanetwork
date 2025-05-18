// src/app/u/[username]/ProfileClient.tsx
'use client';

import Image from 'next/image';
import {
  useUserProfileQuery,
  PostFragmentFragment as PostFragment,
} from '@/generated/graphql';
import { PostCard } from '@/components/PostCard';
import { notFound } from 'next/navigation';

export default function ProfileClient({ username }: { username: string }) {
  const { data, loading } = useUserProfileQuery({
    variables: { username },
  });

  if (loading) return <p className="p-4">Loading…</p>;
  if (!data?.user) notFound();

  const u = data.user;
  return (
    <main className="max-w-xl mx-auto p-4 space-y-4">
      <section className="border p-4 rounded bg-white text-center">
        <Image
          src={u.imageUrl || '/default-avatar.png'}
          alt={`${u.username} avatar`}
          width={96}
          height={96}
          className="rounded-full mx-auto"
        />
        <h1 className="text-xl font-bold mt-2">@{u.username}</h1>
        <p className="text-gray-600">{u.bio}</p>
        <div className="flex justify-center gap-6 mt-2 text-sm">
          <span>
            <strong>{u.followersCount}</strong> followers
          </span>
          <span>
            <strong>{u.followingCount}</strong> following
          </span>
        </div>
      </section>

      {(u.posts as PostFragment[]).map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </main>
  );
}
