import {
  ApolloClient,
  HttpLink,
  type ApolloCache,
  type DocumentNode,
  type TypedDocumentNode,
} from '@apollo/client';
import {
  ApolloProvider,
  useApolloClient,
  useMutation,
  useQuery,
} from '@apollo/client/react';
import {
  createContext,
  useCallback,
  useContext,
  type ComponentType,
} from 'react';
import type { HookWrapperComponentProps } from '../allHooks.mjs';
import * as commonHooks from '../commonHooks.js';
import * as commonProcedures from '../commonProcedures.mjs';

export type OnResetCache = (
  client: ApolloClient,
  hintDocument: DocumentNode
) => void;

const onResetCacheContext = createContext<OnResetCache | null>(null);

function createClient(makeCache: () => ApolloCache): ApolloClient {
  const cache = makeCache();
  const link = new HttpLink({ uri: 'http://localhost/graphql' });
  return new ApolloClient({ cache, link });
}

const queryFn: commonProcedures.QueryFn<ApolloClient> = (
  client,
  document,
  variables
) => {
  return client
    .query({
      query: document,
      variables: variables ?? undefined,
      errorPolicy: 'none',
    })
    .then((r) => r.data!);
};

const mutateFn: commonProcedures.MutateFn<ApolloClient> = (
  client,
  document,
  variables
) => {
  return client
    .mutate({ mutation: document, variables: variables ?? undefined })
    .then((r) => r.data!);
};

export function makeClientInitializer(
  makeCache: () => ApolloCache
): () => ApolloClient {
  return () => createClient(makeCache);
}

export const procedures = Object.fromEntries(
  Object.entries(commonProcedures).map(
    ([name, fn]) =>
      [name, (client: ApolloClient) => fn(client, queryFn, mutateFn)] as const
  )
);

export function makeComponent(
  makeCache: () => ApolloCache,
  onResetCache: OnResetCache | null = null
): [
  ComponentType<HookWrapperComponentProps<ApolloClient>>,
  () => ApolloClient,
] {
  return [
    ({ children, client }) => {
      return (
        <ApolloProvider client={client}>
          <onResetCacheContext.Provider value={onResetCache}>
            {children}
          </onResetCacheContext.Provider>
        </ApolloProvider>
      );
    },
    () => createClient(makeCache),
  ];
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
  Object.entries(commonHooks).map(([name, fn]) => {
    const use = () => fn(useQueryFn, useMutationFn);
    if ('usePrefetch' in fn) {
      use.usePrefetch = () => fn.usePrefetch(useQueryFn, useMutationFn);
    }
    return [name, use] as const;
  })
);
