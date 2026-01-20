import type { ComponentType, PropsWithChildren } from 'react';
import * as ApolloInMemoryCache from './apollo/inMemoryCache.mjs';
import * as ApolloOptimizedNormalizedCache from './apollo/optimizedNormalizedCache.mjs';
import * as ApolloSimpleDocumentCache from './apollo/simpleDocumentCache.mjs';
import * as UrqlDocumentCache from './urql/documentCache.mjs';
import * as UrqlNormalizedCache from './urql/normalizedCache.mjs';

export type HookType = {
  (): boolean;
  usePrefetch?: () => boolean;
};
export type HookWrapperComponentProps<C extends object> = PropsWithChildren<{
  client: C;
}>;
export type AllHooks = Array<
  [
    versionInfo: string,
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: ComponentType<HookWrapperComponentProps<any>>,
    makeClient: () => object,
    hooks: Array<[name: string, fn: HookType]>,
  ]
>;

type HooksInitializer<C extends object> = () => [
  name: string,
  component: ComponentType<HookWrapperComponentProps<C>>,
  makeClient: () => C,
];

function registerHooks<C extends object>(
  out: AllHooks,
  mod: {
    versionInfo: string;
    initializeHooks: HooksInitializer<C>;
    hooks: Record<string, HookType>;
  }
) {
  const [name, component, makeClient] = mod.initializeHooks();
  const hooks: Array<[name: string, fn: HookType]> = [];
  for (const [fnName, fn] of Object.entries<HookType>(mod.hooks)) {
    hooks.push([fnName, fn]);
  }
  out.push([mod.versionInfo, name, component, makeClient, hooks]);
}

export function getAllHooks(): AllHooks {
  const all: AllHooks = [];
  registerHooks(all, ApolloInMemoryCache);
  registerHooks(all, ApolloSimpleDocumentCache);
  registerHooks(all, ApolloOptimizedNormalizedCache);
  registerHooks(all, UrqlDocumentCache);
  registerHooks(all, UrqlNormalizedCache);
  return all;
}
