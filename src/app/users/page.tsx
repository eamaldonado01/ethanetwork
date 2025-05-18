// src/app/users/page.tsx
'use client';

import Image from 'next/image';
import {
  useUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '@/generated/graphql';

export default function UsersPage() {
  const { data, loading } = useUsersQuery();
  const [follow] = useFollowUserMutation({ refetchQueries: ['Users'] });
  const [unfollow] = useUnfollowUserMutation({ refetchQueries: ['Users'] });

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <main className="max-w-lg mx-auto p-4 space-y-3">
      {data?.users.map((u) => (
        <div
          key={u.id}
          className="flex items-center justify-between border p-3 rounded bg-white"
        >
          <div className="flex items-center gap-3">
            <Image
              src={u.imageUrl || '/default-avatar.png'}
              alt={`${u.username} avatar`}
              width={32}
              height={32}
              className="rounded-full"
            />
            <span>@{u.username}</span>
          </div>
          <button
            onClick={() =>
              u.isFollowing
                ? unfollow({ variables: { userId: u.id } })
                : follow({ variables: { userId: u.id } })
            }
            className="text-sm underline"
          >
            {u.isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        </div>
      ))}
    </main>
  );
}
