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
      {/* optional top-bar, kept minimal now */}
      <nav className="flex justify-between border-b bg-white p-4">
        <Link href="/home" className="text-xl font-bold">
          ethanetwork
        </Link>

        {!isLoading && user && (
          <Link
            href="/api/auth/logout"
            prefetch={false}
            className="text-sm underline"
          >
            Logout
          </Link>
        )}
      </nav>

      {children}
    </ApolloProvider>
  );
}
export default ApolloWrapper;
