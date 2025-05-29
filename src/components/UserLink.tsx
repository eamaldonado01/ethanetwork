'use client';

import Link from 'next/link';
import { useUser } from '@/lib/useUser';

type Props = {
  id: string;
  username: string;
  name?: string | null;
};

export default function UserLink({ id, username, name }: Props) {
  const { user } = useUser();

  /* user can be any Auth0 profile shape; discriminate safely */
  const selfId =
    user && typeof user === 'object' && user !== null
      ? 'id' in user && typeof user.id === 'string'
        ? user.id
        : 'sub' in user && typeof user.sub === 'string'
          ? user.sub
          : undefined
      : undefined;

  const href = id === selfId ? '/profile' : `/u/${username}`;

  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
    >
      {name ?? username}
    </Link>
  );
}
