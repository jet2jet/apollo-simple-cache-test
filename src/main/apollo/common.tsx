import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  useApolloClient,
  useMutation,
  useQuery,
  type ApolloCache,
  type DocumentNode,
  type TypedDocumentNode,
} from '@apollo/client';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ComponentType,
  type PropsWithChildren,
} from 'react';
import * as commonHooks from '../commonHooks.js';
import * as commonProcedures from '../commonProcedures.mjs';

export type OnResetCache = (
  client: ApolloClient<unknown>,
  hintDocument: DocumentNode
) => void;

const onResetCacheContext = createContext<OnResetCache | null>(null);

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
  makeCache: () => ApolloCache<unknown>,
  onResetCache: OnResetCache | null = null
): ComponentType<PropsWithChildren> {
  return ({ children }) => {
    const client = useMemo(() => {
      return createClient(makeCache);
    }, []);
    return (
      <ApolloProvider client={client}>
        <onResetCacheContext.Provider value={onResetCache}>
          {children}
        </onResetCacheContext.Provider>
      </ApolloProvider>
    );
  };
}

const useQueryFn: commonHooks.UseQueryFunction = <
  T,
  V extends commonHooks.BaseVariables | void,
>(
  document: TypedDocumentNode<T, V>,
  variables?: V,
  pause?: boolean
) => {
  return useQuery(document, { variables: variables ?? undefined, skip: pause })
    ?.data;
};

const useMutationFn: commonHooks.UseMutationFunction = <
  T,
  V extends commonHooks.BaseVariables,
>(
  document: TypedDocumentNode<T, V>,
  documentToReset: DocumentNode
) => {
  const client = useApolloClient();
  const [mutate] = useMutation(document);
  const onResetCache = useContext(onResetCacheContext);
  return useCallback(
    async (variables: V) => {
      const r = await mutate({ variables });
      if (onResetCache) {
        onResetCache(client, documentToReset);
      }
      return r.data!;
    },
    [client, documentToReset, mutate, onResetCache]
  );
};

export const hooks = Object.fromEntries(
  Object.entries(commonHooks).map(
    ([name, fn]) => [name, () => fn(useQueryFn, useMutationFn)] as const
  )
);
