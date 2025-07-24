import { graphql, HttpResponse } from 'msw';
import {
  ChangePersonMutationDocument,
  PersonDocument,
  PersonsDocument,
  type ChangePersonMutation,
  type PersonQuery,
  type PersonsQuery,
} from '../schema/documents.mjs';
import type { PersonType } from '../schema/types.mjs';
import cloneDeep from '../utils/cloneDeep.mjs';
import { personsData } from './dummyData.mjs';

let mutablePersonsData: PersonType[];

export function resetPersonData(): void {
  mutablePersonsData = cloneDeep(personsData) as PersonType[];
}

resetPersonData();

export const mockPersonsQueryDefault = graphql.query(PersonsDocument, () => {
  return HttpResponse.json<{ data: PersonsQuery }>({
    data: {
      __typename: 'Query',
      persons: mutablePersonsData,
    },
  });
});

export const mockPersonQueryDefault = graphql.query(
  PersonDocument,
  ({ variables }) => {
    const id = variables.id;
    const person = mutablePersonsData.find((p) => p.id === id);
    return HttpResponse.json<{ data: PersonQuery }>({
      data: {
        __typename: 'Query',
        person: person || null,
      },
    });
  }
);

export const mockChangePersonMutationDefault = graphql.mutation(
  ChangePersonMutationDocument,
  ({ variables }) => {
    const input = variables.input;
    const person = mutablePersonsData.find((p) => p.id === input.id);
    if (person && input.name != null) {
      person.name = input.name;
    }
    return HttpResponse.json<{ data: ChangePersonMutation }>({
      data: {
        __typename: 'Mutation',
        changePerson: person ?? null,
      },
    });
  }
);
