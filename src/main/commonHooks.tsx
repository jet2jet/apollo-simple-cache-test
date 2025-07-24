import type { TypedDocumentNode } from '@apollo/client';
import { useMemo } from 'react';
import {
  LocationsDocument,
  PersonDocument,
  PersonsDocument,
} from './schema/documents.mjs';
import cloneDeep from './utils/cloneDeep.mjs';

export type UseQueryFunction = <T, V extends Record<string, unknown> | void>(
  document: TypedDocumentNode<T, V>,
  variables?: V,
  pause?: boolean
) => T | undefined;

function useCloneData<T>(data: T | undefined): T | undefined {
  return useMemo(() => data && cloneDeep(data), [data]);
}

export function useSimple(useQuery: UseQueryFunction): boolean {
  const data1 = useQuery(PersonsDocument);
  const data2 = useQuery(LocationsDocument);
  const d1 = useCloneData(data1);
  const d2 = useCloneData(data2);
  return d1 != null && d2 != null;
}

export function useReadPersonsAndPerson(useQuery: UseQueryFunction): boolean {
  const data = useQuery(PersonsDocument);
  const d = useCloneData(data);
  const childPersons = [...Array<unknown>(100)].map((_, i) => {
    const id = d?.persons[i]?.id ?? null;
    // This may be hacky, but the map-call count is constant so there should be no problem
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const childData = useQuery(PersonDocument, { id: id ?? -1 }, id == null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const c = useCloneData(childData);
    return c;
  });
  return childPersons.every((p) => p);
}
