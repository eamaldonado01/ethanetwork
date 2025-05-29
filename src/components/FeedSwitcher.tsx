'use client';

import { useState } from 'react';

type Tab = 'recent' | 'liked';

export default function FeedSwitcher({
  onChange,
}: {
  onChange?: (tab: Tab) => void; // ← now optional
}) {
  const [tab, setTab] = useState<Tab>('recent');

  return (
    <div className="mb-4 flex justify-center gap-8">
      {(['recent', 'liked'] as const).map((t) => (
        <button
          key={t}
          onClick={() => {
            setTab(t);
            onChange?.(t); // call only if provided
          }}
          className={`relative pb-2 text-lg ${
            tab === t ? 'font-semibold' : ''
          }`}
        >
          {t === 'recent' ? 'Recent' : 'Most liked'}
          {tab === t && (
            <span className="absolute bottom-0 left-0 h-0.5 w-full bg-indigo-600" />
          )}
        </button>
      ))}
    </div>
  );
}
