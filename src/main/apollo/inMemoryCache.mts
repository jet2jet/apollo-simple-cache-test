import { ApolloClient, InMemoryCache } from '@apollo/client';
import type { ComponentType } from 'react';
import type { HookWrapperComponentProps } from '../allHooks.mjs';
import { possibleTypes } from '../schema/documents.mjs';
import getPackageVersion from '../utils/getPackageVersion.mjs';
import { makeClientInitializer, makeComponent } from './common.js';

export const versionInfo = getPackageVersion('@apollo/client');

function makeCache() {
  return new InMemoryCache({
    possibleTypes,
    typePolicies: {
      Query: {
        fields: {
          person: {
            read: (existing: unknown, options) => {
              if (existing) {
                return existing;
              }
              const id: unknown = options.args && options.args.id;
              if (typeof id !== 'number') {
                return undefined;
              }
              const ref = options.toReference({
                __typename: 'Person',
                id,
              });
              return ref;
            },
          },
        },
      },
    },
  });
}

export function initializeProcedures(): [
  name: string,
  makeClient: () => ApolloClient,
] {
  return ['apollo/InMemoryCache', makeClientInitializer(makeCache)];
}

export function initializeHooks(): [
  name: string,
  component: ComponentType<HookWrapperComponentProps<ApolloClient>>,
  makeClient: () => ApolloClient,
] {
  const [component, makeClient] = makeComponent(makeCache);
  return ['apollo/InMemoryCache', component, makeClient];
}

export * from './common.js';
