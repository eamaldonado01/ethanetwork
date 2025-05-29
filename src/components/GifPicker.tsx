'use client';

import { useEffect, useState } from 'react';
import { searchGifs, GifResult } from '@/lib/gif';

interface Props {
  onSelect(url: string): void;
  onClose(): void;
}

export default function GifPicker({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<GifResult[]>([]);
  const [loading, setLoad] = useState(false);

  const fetch = async (q = '') => {
    setLoad(true);
    try {
      setItems(await searchGifs(q));
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    fetch(); // trending on mount
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl space-y-3 rounded bg-neutral-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-2">
          <input
            className="flex-1 rounded bg-neutral-800 p-2 text-sm outline-none"
            placeholder="Search GIFs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetch(query);
            }}
          />
          <button
            className="rounded bg-indigo-600 px-4 text-sm hover:bg-indigo-500"
            onClick={() => fetch(query)}
          >
            Search
          </button>
        </div>

        {loading && (
          <p className="text-center text-xs text-neutral-400">Loading…</p>
        )}

        <div className="grid max-h-[60vh] grid-cols-3 gap-2 overflow-y-auto">
          {items.map((g) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={g.id}
              src={g.tiny}
              alt={g.alt}
              className="cursor-pointer rounded object-cover"
              onClick={() => {
                onSelect(g.url);
                onClose();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
