import { type ComponentType, type PropsWithChildren } from 'react';
import { cacheExchange, Client } from 'urql';
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
  component: ComponentType<PropsWithChildren>,
] {
  return [
    'urql/DocumentCache',
    makeComponent(getCacheExchange, (hintDocument) => {
      return hintDocument === PersonsDocument
        ? { additionalTypenames: ['Person'] }
        : undefined;
    }),
  ];
}

export * from './common.js';
