import { type DocumentNode } from 'graphql';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ComponentType,
  type PropsWithChildren,
} from 'react';
import {
  Client,
  createClient,
  fetchExchange,
  Provider,
  useMutation,
  useQuery,
  type Exchange,
  type OperationContext,
  type TypedDocumentNode,
} from 'urql';
import * as commonHooks from '../commonHooks.js';
import * as commonProcedures from '../commonProcedures.mjs';

export type GetAdditionalMutationOptions = (
  hintDocument: DocumentNode
) => Partial<OperationContext> | undefined;

const getAdditionalMutationOptionsContext =
  createContext<GetAdditionalMutationOptions | null>(null);

function makeClient(getCacheExchange: () => Exchange) {
  return createClient({
    url: 'http://localhost/graphql',
    exchanges: [getCacheExchange(), fetchExchange],
  });
}

const queryFn: commonProcedures.QueryFn<Client> = async <
  T,
  V extends Record<string, unknown> | void,
>(
  client: Client,
  document: TypedDocumentNode<T, V>,
  variables?: V
) => {
  const r = await client.query(document, variables as V).toPromise();
  return r.data!;
};

const mutateFn: commonProcedures.MutateFn<Client> = async <
  T,
  V extends Record<string, unknown> | void,
>(
  client: Client,
  document: TypedDocumentNode<T, V>,
  variables?: V
) => {
  const r = await client.mutation(document, variables as V).toPromise();
  return r.data!;
};

export function makeClientInitializer(
  getCacheExchange: () => Exchange
): () => Client {
  return () => makeClient(getCacheExchange);
}

export const procedures = Object.fromEntries(
  Object.entries(commonProcedures).map(
    ([name, fn]) =>
      [name, (client: Client) => fn(client, queryFn, mutateFn)] as const
  )
);

export function makeComponent(
  getCacheExchange: () => Exchange,
  getAdditionalMutationOptions: GetAdditionalMutationOptions | null = null
): ComponentType<PropsWithChildren> {
  return ({ children }) => {
    const client = useMemo(() => {
      return makeClient(getCacheExchange);
    }, []);
    return (
      <Provider value={client}>
        <getAdditionalMutationOptionsContext.Provider
          value={getAdditionalMutationOptions}
        >
          {children}
        </getAdditionalMutationOptionsContext.Provider>
      </Provider>
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
  return useQuery({ query: document, variables: variables as V, pause })[0]
    .data;
};

const useMutationFn: commonHooks.UseMutationFunction = <
  T,
  V extends commonHooks.BaseVariables,
>(
  document: TypedDocumentNode<T, V>,
  documentToReset: DocumentNode
) => {
  const [, mutate] = useMutation(document);
  const getAdditionalMutationOptions = useContext(
    getAdditionalMutationOptionsContext
  );
  return useCallback(
    async (variables: V) => {
      let context: Partial<OperationContext> | undefined;
      if (getAdditionalMutationOptions) {
        context = getAdditionalMutationOptions(documentToReset);
      }
      const r = await mutate(variables, context);
      return r.data!;
    },
    [documentToReset, getAdditionalMutationOptions, mutate]
  );
};

export const hooks = Object.fromEntries(
  Object.entries(commonHooks).map(
    ([name, fn]) => [name, () => fn(useQueryFn, useMutationFn)] as const
  )
);
