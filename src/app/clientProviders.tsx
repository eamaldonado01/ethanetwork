// ─── src/app/clientProviders.tsx ─────────────────────────────────────
'use client';

import { ApolloProvider } from '@apollo/client';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { client } from '@/lib/apolloClient';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </UserProvider>
  );
}
