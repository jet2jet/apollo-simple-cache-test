import type { TypedDocumentNode } from '@apollo/client';
import {
  ChangePersonMutationDocument,
  LocationsDocument,
  PersonDocument,
  PersonsDocument,
} from './schema/documents.mjs';
import cloneDeep from './utils/cloneDeep.mjs';

export type QueryFn<C extends object> = <
  T,
  V extends Record<string, unknown> | void,
>(
  client: C,
  document: TypedDocumentNode<T, V>,
  variables?: V
) => Promise<T>;

export type MutateFn<C extends object> = <
  T,
  V extends Record<string, unknown> | void,
>(
  client: C,
  document: TypedDocumentNode<T, V>,
  variables?: V
) => Promise<T>;

export async function runSimple<C extends object>(
  client: C,
  query: QueryFn<C>,
  _mutate: MutateFn<C>
): Promise<void> {
  await Promise.all([
    query(client, PersonsDocument).then(cloneDeep),
    query(client, LocationsDocument).then(cloneDeep),
  ]);
}

export async function runQueryPersonsAndQueryPerson<C extends object>(
  client: C,
  query: QueryFn<C>,
  _mutate: MutateFn<C>
): Promise<void> {
  const data = await query(client, PersonsDocument).then(cloneDeep);
  await Promise.all(
    data.persons.map((p) =>
      query(client, PersonDocument, { id: p.id }).then(cloneDeep)
    )
  );
}

export async function runQueryAndMutateAndQuery<C extends object>(
  client: C,
  query: QueryFn<C>,
  mutate: MutateFn<C>
): Promise<void> {
  const data = await query(client, PersonsDocument).then(cloneDeep);
  await Promise.all(
    data.persons.map(async (p) => {
      await mutate(client, ChangePersonMutationDocument, {
        input: { id: p.id, name: p.name + '_Mod' },
      });
    })
  );
  await Promise.all(
    data.persons.map(async (p) => {
      const data2 = await query(client, PersonDocument, { id: p.id }).then(
        cloneDeep
      );
      if (data2.person!.name !== p.name + '_Mod') {
        throw new Error('Unexpected');
      }
    })
  );
}
