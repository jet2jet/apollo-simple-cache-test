import type { DocumentNode, TypedDocumentNode } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import {
  ChangePersonMutationDocument,
  LocationsDocument,
  PersonDocument,
  PersonsDocument,
} from './schema/documents.mjs';
import cloneDeep from './utils/cloneDeep.mjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BaseVariables = Record<string, any>;

export type UseQueryFunction = <T, V extends BaseVariables | void>(
  document: TypedDocumentNode<T, V>,
  variables?: V,
  pause?: boolean
) => T | undefined;

export type UseMutationFunction = <T, V extends BaseVariables>(
  document: TypedDocumentNode<T, V>,
  documentToReset: DocumentNode
) => (variables: V) => Promise<T>;

function useCloneData<T>(data: T | undefined): T | undefined {
  return useMemo(() => data && cloneDeep(data), [data]);
}

export function useSimple(
  useQuery: UseQueryFunction,
  _: UseMutationFunction
): boolean {
  const data1 = useQuery(PersonsDocument);
  const data2 = useQuery(LocationsDocument);
  const d1 = useCloneData(data1);
  const d2 = useCloneData(data2);
  return d1 != null && d2 != null;
}

export function useReadAndCache(
  useQuery: UseQueryFunction,
  _: UseMutationFunction
): boolean {
  const data1 = useQuery(PersonsDocument);
  const d1 = useCloneData(data1);
  const data2 = useQuery(PersonsDocument, undefined, data1 == null);
  const d2 = useCloneData(data2);
  return d1 != null && d2 != null;
}

export function useReadPersonsAndPerson(
  useQuery: UseQueryFunction,
  _: UseMutationFunction
): boolean {
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

export function useReadPersonsAndMutatePerson(
  useQuery: UseQueryFunction,
  useMutation: UseMutationFunction
): boolean {
  const [isMutated, setIsMutated] = useState(false);
  const data = useQuery(PersonsDocument);
  const mutate = useMutation(ChangePersonMutationDocument, PersonsDocument);
  useEffect(() => {
    if (data) {
      const p = data.persons[0]!;
      void mutate({ input: { id: p.id, name: p.name + '_Mod' } }).then(() => {
        setIsMutated(true);
      });
    }
  }, [data, mutate]);
  return isMutated && data != null && data.persons[0]!.name.endsWith('_Mod');
}
