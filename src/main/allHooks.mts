import type { ComponentType, PropsWithChildren } from 'react';
import * as ApolloInMemoryCache from './apollo/inMemoryCache.mjs';
import * as ApolloOptimizedNormalizedCache from './apollo/optimizedNormalizedCache.mjs';
import * as ApolloSimpleDocumentCache from './apollo/simpleDocumentCache.mjs';
import * as UrqlDocumentCache from './urql/documentCache.mjs';
import * as UrqlNormalizedCache from './urql/normalizedCache.mjs';

export type HookType = () => boolean;
export type AllHooks = Array<
  [
    versionInfo: string,
    name: string,
    component: ComponentType<PropsWithChildren>,
    hooks: Array<[name: string, fn: HookType]>,
  ]
>;

type HooksInitializer = () => [
  name: string,
  component: ComponentType<PropsWithChildren>,
];

function registerHooks(
  out: AllHooks,
  mod: {
    versionInfo: string;
    initializeHooks: HooksInitializer;
    hooks: Record<string, HookType>;
  }
) {
  const [name, component] = mod.initializeHooks();
  const hooks: Array<[name: string, fn: HookType]> = [];
  for (const [fnName, fn] of Object.entries<HooksInitializer | HookType>(
    mod.hooks
  )) {
    hooks.push([fnName, fn as HookType]);
  }
  out.push([mod.versionInfo, name, component, hooks]);
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
