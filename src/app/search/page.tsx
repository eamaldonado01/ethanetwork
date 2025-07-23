'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import UserLink from '@/components/UserLink';
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '@/generated/graphql';
import { searchUsers } from '@/lib/api';

/*───────────────────────────────────────────────────────────────────────────*/
interface Hit {
  id: string;
  username: string;
  name: string;
  imageUrl?: string | null;
  isFollowing: boolean;
}

/*───────────────────────────────────────────────────────────────────────────*/
export default function SearchPage() {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [follow] = useFollowUserMutation();
  const [unfollow] = useUnfollowUserMutation();

  /* ─── fetch all users or live search (150 ms debounce) ────────────────── */
  useEffect(() => {
    // helper to map and sort users
    const normalizeAndSort = (users: Record<string, any>[]) => {
      const list: Hit[] = users.map(u => ({
        id: u.id as string,
        username: u.username as string,
        name: (u.name as string | null) ?? (u.username as string),
        imageUrl: (u.imageUrl as string | null) ?? null,
        isFollowing: Boolean(u.isFollowing),
      }));
      // alphabetical by name
      return list.sort((a, b) => a.name.localeCompare(b.name));
    };

    if (!q.trim()) {
      // show all users alphabetically
      (async () => {
        try {
          const apiUsers = (await searchUsers('')) as Record<string, any>[];
          setHits(normalizeAndSort(apiUsers));
        } catch {
          // ignore
        }
      })();
      return;
    }

    // live search when q is non-empty
    const handle = setTimeout(async () => {
      try {
        const apiUsers = (await searchUsers(q.trim())) as Record<string, any>[];
        const regex = new RegExp('^' + q.trim(), 'i');
        const filtered = normalizeAndSort(apiUsers).filter(u =>
          regex.test(u.name),
        );
        setHits(filtered);
      } catch {
        // ignore network errors
      }
    }, 150);

    return () => clearTimeout(handle);
  }, [q]);

  /* ─── follow / unfollow helper ────────────────────────────────────────── */
  const flipFollow = async (user: Hit) => {
    if (user.isFollowing) {
      await unfollow({ variables: { userId: user.id } });
    } else {
      await follow({ variables: { userId: user.id } });
    }
    setHits(prev =>
      prev.map(x =>
        x.id === user.id ? { ...x, isFollowing: !x.isFollowing } : x,
      ),
    );
  };

  /* ─── render ────────────────────────────────────────────────────────── */
  return (
    <main className="mx-auto max-w-2xl px-4">
      {/* search bar */}
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search users…"
        className="mb-6 w-full rounded bg-zinc-800 px-3 py-2 text-sm outline-none"
      />

      {/* results */}
      <ul className="space-y-3">
        {hits.map(u => {
          const btnClasses =
            (u.isFollowing
              ? 'border border-zinc-500 bg-transparent text-zinc-200 hover:bg-zinc-800'
              : 'bg-indigo-600 text-white hover:bg-indigo-500') +
            ' hover:brightness-110 rounded px-3 py-[2px] text-xs transition-colors';

          return (
            <li
              key={u.id}
              className="group flex items-center justify-between rounded bg-neutral-900 p-3 transition-colors hover:bg-neutral-800"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={u.imageUrl ?? '/default-avatar.jpg'}
                  alt={`${u.name} avatar`}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
                {/* clickable name only */}
                <UserLink id={u.id} username={u.username} name={u.name} />
              </div>

              <button className={btnClasses} onClick={() => flipFollow(u)}>
                {u.isFollowing ? 'Following' : 'Follow'}
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
