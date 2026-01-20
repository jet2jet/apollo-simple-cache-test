import type { ApolloClient } from '@apollo/client';
import { OptimizedNormalizedCache } from 'apollo-simple-cache/v4';
import type { ComponentType } from 'react';
import type { HookWrapperComponentProps } from '../allHooks.mjs';
import { possibleTypes } from '../schema/documents.mjs';
import getPackageVersion from '../utils/getPackageVersion.mjs';
import { makeClientInitializer, makeComponent } from './common.js';

export const versionInfo = getPackageVersion('apollo-simple-cache');

function makeCache() {
  return new OptimizedNormalizedCache({
    possibleTypes,
    optimizedRead: {
      Query: (fieldName, existingValue, context) => {
        if (fieldName !== 'person') {
          return existingValue;
        }
        if (existingValue) {
          return existingValue;
        }
        const id = context.effectiveArguments.id;
        if (typeof id !== 'number') {
          return existingValue;
        }
        const ref = context.dataIdFromObject({
          __typename: 'Person',
          id,
        });
        return ref ? context.readFromId(ref) : existingValue;
      },
    },
  });
}

export function initializeProcedures(): [
  name: string,
  makeClient: () => ApolloClient,
] {
  return ['apollo/OptimizedNormalizedCache', makeClientInitializer(makeCache)];
}

export function initializeHooks(): [
  name: string,
  component: ComponentType<HookWrapperComponentProps<ApolloClient>>,
  makeClient: () => ApolloClient,
] {
  const [component, makeClient] = makeComponent(makeCache);
  return ['apollo/OptimizedNormalizedCache', component, makeClient];
}

export * from './common.js';
