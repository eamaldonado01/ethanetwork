// src/components/Navbar.tsx
'use client';

import { useUser } from '@/lib/useUser';
import Link from 'next/link';

export default function Navbar() {
  const { user, isLoading } = useUser();

  return (
    <nav className="flex justify-between border-b bg-white p-4">
      <Link href="/" className="text-xl font-bold">
        ethanetwork
      </Link>

      {!isLoading && user && (
        <button
          type="button"
          onClick={() => window.location.assign('/api/auth/logout')}
          className="text-sm underline"
        >
          Logout
        </button>
      )}
    </nav>
  );
}
