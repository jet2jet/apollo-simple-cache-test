import type { ApolloClient } from '@apollo/client';
import { SimpleDocumentCache } from 'apollo-simple-cache';
import { type ComponentType, type PropsWithChildren } from 'react';
import getPackageVersion from '../utils/getPackageVersion.mjs';
import { makeClientInitializer, makeComponent } from './common.js';

export const versionInfo = getPackageVersion('apollo-simple-cache');

function makeCache() {
  return new SimpleDocumentCache();
}

export function initializeProcedures(): [
  name: string,
  makeClient: () => ApolloClient<unknown>,
] {
  return ['apollo/SimpleDocumentCache', makeClientInitializer(makeCache)];
}

export function initializeHooks(): [
  name: string,
  component: ComponentType<PropsWithChildren>,
] {
  return ['apollo/SimpleDocumentCache', makeComponent(makeCache)];
}

export * from './common.js';
