'use client';

import Image from 'next/image';
import {
  useUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '@/generated/graphql';

export default function UsersClient() {
  /* Users query requires a non-optional `search` variable */
  const { data, loading } = useUsersQuery({
    variables: { search: '' }, // empty string ⇒ list everyone
  });

  const [follow] = useFollowUserMutation({ refetchQueries: ['Users'] });
  const [unfollow] = useUnfollowUserMutation({ refetchQueries: ['Users'] });

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <main className="mx-auto max-w-lg space-y-3 p-4">
      {data?.users.map((u) => (
        <div
          key={u.id}
          className="flex items-center justify-between rounded border bg-white p-3"
        >
          <div className="flex items-center gap-3">
            <Image
              src={u.imageUrl || '/default-avatar.jpg'}
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
