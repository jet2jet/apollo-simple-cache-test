import { cacheExchange } from '@urql/exchange-graphcache';
import type { ComponentType } from 'react';
import type { Client } from 'urql';
import type { HookWrapperComponentProps } from '../allHooks.mjs';
import { introspectionData } from '../schema/schema.mjs';
import getPackageVersion from '../utils/getPackageVersion.mjs';
import { makeClientInitializer, makeComponent } from './common.js';

export const versionInfo = getPackageVersion('@urql/exchange-graphcache');

function getCacheExchange() {
  return cacheExchange({
    schema: introspectionData,
    keys: { Tag: () => null },
    resolvers: {
      Query: {
        person: (_, args: { id: number }) => {
          return { __typename: 'Person', id: args.id };
        },
      },
    },
  });
}

export function initializeProcedures(): [
  name: string,
  makeClient: () => Client,
] {
  return ['urql/NormalizedCache', makeClientInitializer(getCacheExchange)];
}

export function initializeHooks(): [
  name: string,
  component: ComponentType<HookWrapperComponentProps<Client>>,
  makeClient: () => Client,
] {
  const [component, makeClient] = makeComponent(getCacheExchange);
  return ['urql/NormalizedCache', component, makeClient];
}

export * from './common.js';
