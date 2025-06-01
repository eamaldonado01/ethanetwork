'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import UserLink from '@/components/UserLink';
import { fetchGraphQL } from '@/lib/fetchGraphQL';
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '@/generated/graphql';

type U = {
  id: string;
  username: string;
  name: string | null;
  imageUrl: string | null;
  isFollowing: boolean;
};

export default function NewUsers() {
  const [users, setUsers] = useState<U[]>([]);
  const [follow] = useFollowUserMutation();
  const [unfollow] = useUnfollowUserMutation();

  /* fetch 5 newest users once on mount */
  useEffect(() => {
    fetchGraphQL<{ latest: U[] }, Record<string, never>>(
      /* GraphQL */ `
        query {
          latest: users(first: 5) {
            id
            username
            name
            imageUrl
            isFollowing
          }
        }
      `,
      {}, // variables – still empty but now strongly typed
    ).then(({ latest }) => setUsers(latest));
  }, []);

  return (
    <aside className="w-64 space-y-4 rounded bg-neutral-900 p-4 shadow">
      <h2 className="text-sm font-semibold">Latest Users</h2>

      {users.map((u) => {
        const btnClass =
          (u.isFollowing
            ? 'border border-zinc-500 bg-transparent text-zinc-200 hover:bg-zinc-800'
            : 'bg-indigo-600 text-white hover:bg-indigo-500') +
          ' hover:brightness-110 transition-colors rounded px-3 py-[2px] text-xs';

        const toggle = () => {
          (u.isFollowing ? unfollow : follow)({ variables: { userId: u.id } });
          setUsers((prev) =>
            prev.map((x) =>
              x.id === u.id ? { ...x, isFollowing: !x.isFollowing } : x,
            ),
          );
        };

        return (
          <div key={u.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Image
                src={u.imageUrl ?? '/default-avatar.jpg'}
                alt="avatar"
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover"
              />
              <UserLink id={u.id} username={u.username} name={u.name} />
            </div>

            <button className={btnClass} onClick={toggle}>
              {u.isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        );
      })}
    </aside>
  );
}
