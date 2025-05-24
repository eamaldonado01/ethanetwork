// src/lib/ApolloWrapper.tsx
'use client';

import { ApolloProvider } from '@apollo/client';
import { client } from '@/lib/apolloClient';
import { useUser } from '@/lib/useUser';
import Link from 'next/link';

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();

  return (
    <ApolloProvider client={client}>
      <nav className="p-4 border-b flex justify-between bg-white">
        <Link href="/" className="font-bold text-xl">
          Odin Book
        </Link>

        {!isLoading &&
          (user ? (
            /* disable prefetch so Next.js does a full navigation  */
            <Link
              href="/api/auth/logout"
              prefetch={false}
              className="text-sm underline"
            >
              Logout
            </Link>
          ) : (
            <Link href="/api/auth/login" className="text-sm underline">
              Login
            </Link>
          ))}
      </nav>
      {children}
    </ApolloProvider>
  );
}
