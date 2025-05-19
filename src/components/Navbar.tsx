'use client';

import Link from 'next/link';
import { useUser } from '@/lib/useUser';

export default function Navbar() {
  const { user, isLoading } = useUser();

  return (
    <nav className="p-4 border-b flex justify-between bg-white">
      <Link href="/" className="font-bold text-xl">
        Odin Book
      </Link>

      {isLoading ? null : user ? (
        // full‐page nav ensures the cookie is sent
        <Link href="/api/auth/logout" className="text-sm underline">
          Logout
        </Link>
      ) : (
        <Link href="/api/auth/login" className="text-sm underline">
          Login
        </Link>
      )}
    </nav>
  );
}
