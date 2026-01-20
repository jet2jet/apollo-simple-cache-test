import type { ComponentType } from 'react';
import { cacheExchange, Client } from 'urql';
import type { HookWrapperComponentProps } from '../allHooks.mjs';
import { PersonsDocument } from '../schema/documents.mjs';
import getPackageVersion from '../utils/getPackageVersion.mjs';
import { makeClientInitializer, makeComponent } from './common.js';

export const versionInfo = getPackageVersion('urql');

function getCacheExchange() {
  return cacheExchange;
}

export function initializeProcedures(): [
  name: string,
  makeClient: () => Client,
] {
  return ['urql/DocumentCache', makeClientInitializer(getCacheExchange)];
}

export function initializeHooks(): [
  name: string,
  component: ComponentType<HookWrapperComponentProps<Client>>,
  makeClient: () => Client,
] {
  const [component, makeClient] = makeComponent(
    getCacheExchange,
    (hintDocument) => {
      return hintDocument === PersonsDocument
        ? { additionalTypenames: ['Person'] }
        : undefined;
    }
  );
  return ['urql/DocumentCache', component, makeClient];
}

export * from './common.js';
