'use client';

import { useState } from 'react';
import PostFeed from '@/components/PostFeed';
import NewUsers from '@/components/NewUsers';

export default function HomePage() {
  /* which feed is displayed */
  const [mode, setMode] = useState<'recent' | 'liked'>('recent');

  /* tab helper */
  const Tab = ({
    label,
    value,
  }: {
    label: string;
    value: 'recent' | 'liked';
  }) => (
    <button
      onClick={() => setMode(value)}
      className={`px-4 pb-1 text-lg font-semibold capitalize transition-colors ${
        mode === value
          ? 'border-b-2 border-indigo-500 text-indigo-300'
          : 'text-gray-400 hover:text-indigo-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="w-full p-6">
      {/* centred timeline */}
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex justify-center gap-8">
          <Tab label="Recent" value="recent" />
          <Tab label="Most Liked" value="liked" />
        </div>

        <PostFeed mode={mode} />
      </div>

      {/* latest-users card – lower, wider, and under the feed if overlap occurs */}
      <aside className="fixed right-0 top-[90px] hidden w-[20rem] lg:block origin-top-right scale-[1.15]">
        <NewUsers />
      </aside>
    </main>
  );
}
