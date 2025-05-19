'use client';

import { ApolloWrapper } from '@/lib/ApolloWrapper';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApolloWrapper>{children}</ApolloWrapper>;
}
