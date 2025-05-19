// src/lib/apolloClient.ts
import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

// 1️⃣ HTTP link for queries & mutations — now including cookies
const httpLink = new HttpLink({
  uri: '/api/graphql',
  credentials: 'include', // ← send Auth0 session cookie on each request
});

// 2️⃣ WS link for subscriptions — same-origin cookies flow automatically
const wsLink =
  typeof window !== 'undefined'
    ? new GraphQLWsLink(
        createClient({
          url: `${
            window.location.protocol === 'https:' ? 'wss' : 'ws'
          }://${window.location.host}/api/socket`,
        }),
      )
    : null;

// 3️⃣ Split based on operation type
const splitLink = wsLink
  ? split(
      ({ query }) => {
        const def = getMainDefinition(query);
        return (
          def.kind === 'OperationDefinition' && def.operation === 'subscription'
        );
      },
      wsLink,
      httpLink,
    )
  : httpLink;

// 4️⃣ Finally, create the Apollo client
export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
