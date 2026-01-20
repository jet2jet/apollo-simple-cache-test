import type { ApolloClient } from '@apollo/client';
import { SimpleDocumentCache } from 'apollo-simple-cache/v4';
import type { ComponentType } from 'react';
import type { HookWrapperComponentProps } from '../allHooks.mjs';
import { PersonsDocument } from '../schema/documents.mjs';
import getPackageVersion from '../utils/getPackageVersion.mjs';
import { makeClientInitializer, makeComponent } from './common.js';

export const versionInfo = getPackageVersion('apollo-simple-cache');

function makeCache() {
  return new SimpleDocumentCache();
}

export function initializeProcedures(): [
  name: string,
  makeClient: () => ApolloClient,
] {
  return ['apollo/SimpleDocumentCache', makeClientInitializer(makeCache)];
}

export function initializeHooks(): [
  name: string,
  component: ComponentType<HookWrapperComponentProps<ApolloClient>>,
  makeClient: () => ApolloClient,
] {
  const [component, makeClient] = makeComponent(
    makeCache,
    (client, hintDocument) => {
      if (hintDocument === PersonsDocument) {
        client.cache.modify({
          fields: { persons: (_, details) => details.DELETE },
        });
      }
    }
  );
  return ['apollo/SimpleDocumentCache', component, makeClient];
}

export * from './common.js';
