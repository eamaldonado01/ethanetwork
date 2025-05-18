'use client';

import { ApolloProvider } from '@apollo/client';
import { client } from '@/lib/apolloClient';
import { useUser } from '@/lib/useUser';
import Link from 'next/link';

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();

  return (
    <ApolloProvider client={client}>
      <nav className="p-4 border-b flex justify-between">
        <Link href="/" className="font-bold text-xl">
          Odin Book
        </Link>
        <div>
          {isLoading ? null : user ? (
            <Link href="/api/auth/logout" className="text-sm underline">
              Logout
            </Link>
          ) : (
            <Link href="/api/auth/login" className="text-sm underline">
              Login
            </Link>
          )}
        </div>
      </nav>
      {children}
    </ApolloProvider>
  );
}
