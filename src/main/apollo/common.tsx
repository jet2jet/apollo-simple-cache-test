import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  useQuery,
  type ApolloCache,
  type TypedDocumentNode,
} from '@apollo/client';
import { useMemo, type ComponentType, type PropsWithChildren } from 'react';
import * as commonHooks from '../commonHooks.js';
import * as commonProcedures from '../commonProcedures.mjs';

function createClient(
  makeCache: () => ApolloCache<unknown>
): ApolloClient<unknown> {
  const cache = makeCache();
  const link = new HttpLink({ uri: 'http://localhost/graphql' });
  return new ApolloClient({ cache, link });
}

const queryFn: commonProcedures.QueryFn<ApolloClient<unknown>> = (
  client,
  document,
  variables
) => {
  return client
    .query({ query: document, variables: variables ?? undefined })
    .then((r) => r.data);
};

const mutateFn: commonProcedures.MutateFn<ApolloClient<unknown>> = (
  client,
  document,
  variables
) => {
  return client
    .mutate({ mutation: document, variables: variables ?? undefined })
    .then((r) => r.data!);
};

export function makeClientInitializer(
  makeCache: () => ApolloCache<unknown>
): () => ApolloClient<unknown> {
  return () => createClient(makeCache);
}

export const procedures = Object.fromEntries(
  Object.entries(commonProcedures).map(
    ([name, fn]) =>
      [
        name,
        (client: ApolloClient<unknown>) => fn(client, queryFn, mutateFn),
      ] as const
  )
);

export function makeComponent(
  makeCache: () => ApolloCache<unknown>
): ComponentType<PropsWithChildren> {
  return ({ children }) => {
    const client = useMemo(() => {
      return createClient(makeCache);
    }, []);
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
  };
}

const useQueryFn: commonHooks.UseQueryFunction = <
  T,
  V extends Record<string, unknown> | void,
>(
  document: TypedDocumentNode<T, V>,
  variables?: V,
  pause?: boolean
) => {
  return useQuery(document, { variables: variables ?? undefined, skip: pause })
    ?.data;
};

export const hooks = Object.fromEntries(
  Object.entries(commonHooks).map(
    ([name, fn]) => [name, () => fn(useQueryFn)] as const
  )
);
