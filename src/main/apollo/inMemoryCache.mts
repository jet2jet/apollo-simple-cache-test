import { ApolloClient, InMemoryCache } from '@apollo/client';
import { type ComponentType, type PropsWithChildren } from 'react';
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
  component: ComponentType<PropsWithChildren>,
] {
  return ['apollo/InMemoryCache', makeComponent(makeCache)];
}

export * from './common.js';
