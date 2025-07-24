import * as ApolloInMemoryCache from './apollo/inMemoryCache.mjs';
import * as ApolloOptimizedNormalizedCache from './apollo/optimizedNormalizedCache.mjs';
import * as ApolloSimpleDocumentCache from './apollo/simpleDocumentCache.mjs';
import * as UrqlDocumentCache from './urql/documentCache.mjs';
import * as UrqlNormalizedCache from './urql/normalizedCache.mjs';

export type ProcedureType<C extends object> = (client: C) => Promise<void>;
export type AllProcedures = Array<
  [
    versionInfo: string,
    name: string,
    makeClient: () => object,
    procedures: Array<[name: string, fn: ProcedureType<object>]>,
  ]
>;

type ProceduresInitializer<C extends object> = () => [
  name: string,
  makeClient: () => C,
];

function registerProcedures<C extends object>(
  out: AllProcedures,
  mod: {
    versionInfo: string;
    initializeProcedures: ProceduresInitializer<C>;
    procedures: Record<string, ProcedureType<C>>;
  }
) {
  const [name, component] = mod.initializeProcedures();
  const procedures: Array<[name: string, fn: ProcedureType<object>]> = [];
  for (const [fnName, fn] of Object.entries<
    ProceduresInitializer<C> | ProcedureType<C>
  >(mod.procedures)) {
    procedures.push([fnName, fn as ProcedureType<object>]);
  }
  out.push([mod.versionInfo, name, component, procedures]);
}

export function getAllProcedures(): AllProcedures {
  const all: AllProcedures = [];
  registerProcedures(all, ApolloInMemoryCache);
  registerProcedures(all, ApolloSimpleDocumentCache);
  registerProcedures(all, ApolloOptimizedNormalizedCache);
  registerProcedures(all, UrqlDocumentCache);
  registerProcedures(all, UrqlNormalizedCache);
  return all;
}
