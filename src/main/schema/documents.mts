import {
  gql,
  type PossibleTypesMap,
  type TypedDocumentNode,
} from '@apollo/client';
import type {
  LocationVariablesType,
  PersonVariablesType,
  PersonType,
  QueryType,
  ChangePersonVariablesType,
  MutationType,
} from './types.mjs';

export type PersonsQuery = Pick<QueryType, '__typename' | 'persons'>;
export type PersonQuery = Pick<QueryType, '__typename' | 'person'>;
export type PersonSimpleQuery = Pick<QueryType, '__typename'> & {
  person: Pick<PersonType, '__typename' | 'id' | 'name'>;
};
export type LocationsQuery = Pick<QueryType, '__typename' | 'locations'>;
export type LocationQuery = Pick<QueryType, '__typename' | 'location'>;
export type LocationNamesQuery = Pick<
  QueryType,
  '__typename' | 'locationNames'
>;

export type ChangePersonMutation = Pick<
  MutationType,
  '__typename' | 'changePerson'
>;

export type PersonFragment = Pick<
  PersonType,
  '__typename' | 'id' | 'name' | 'address'
>;
export interface PersonsQueryWithFragment {
  readonly __typename: QueryType['__typename'];
  readonly persons: ReadonlyArray<
    Pick<PersonType, 'id' | 'tags'> & PersonFragment
  >;
}
export interface PersonQueryWithFragment {
  readonly __typename: QueryType['__typename'];
  readonly person: (Pick<PersonType, 'id' | 'tags'> & PersonFragment) | null;
}

export const PersonsDocument = gql`
  query Persons {
    persons {
      id
      name
      tags {
        name
      }
      address {
        id
        ... on Prefecture {
          name
        }
        ... on City {
          name
          prefecture {
            id
            name
          }
        }
      }
    }
  }
` as unknown as TypedDocumentNode<PersonsQuery, void>;

export const PersonDocument = gql`
  query Person($id: Int!) {
    person(id: $id) {
      id
      name
      tags {
        name
      }
      address {
        id
        ... on Prefecture {
          name
        }
        ... on City {
          name
          prefecture {
            id
            name
          }
        }
      }
    }
  }
` as unknown as TypedDocumentNode<PersonQuery, PersonVariablesType>;

export const PersonSimpleDocument = gql`
  query PersonSimple($id: Int!) {
    person(id: $id) {
      id
      name
    }
  }
` as unknown as TypedDocumentNode<PersonSimpleQuery, PersonVariablesType>;

export const LocationsDocument = gql`
  query Locations {
    locations {
      id
      ... on Prefecture {
        name
      }
      ... on City {
        name
        prefecture {
          id
          name
        }
      }
    }
  }
` as unknown as TypedDocumentNode<LocationsQuery, void>;

export const LocationDocument = gql`
  query Location($id: Int!) {
    location(id: $id) {
      id
      ... on Prefecture {
        name
      }
      ... on City {
        name
        prefecture {
          id
          name
        }
      }
    }
  }
` as unknown as TypedDocumentNode<LocationQuery, LocationVariablesType>;

export const LocationNamesDocument = gql`
  query LocationNames {
    locationNames
  }
` as unknown as TypedDocumentNode<LocationNamesQuery, void>;

export const PersonChunkFragment = gql`
  fragment PersonChunk on Person {
    id
    name
    address {
      id
      ... on Prefecture {
        name
      }
      ... on City {
        name
        prefecture {
          id
          name
        }
      }
    }
  }
` as unknown as TypedDocumentNode<PersonFragment, void>;

export const PersonsDocumentWithFragment = gql`
  query Persons {
    persons {
      id
      tags {
        name
      }
      ...PersonChunk
    }
  }
  ${PersonChunkFragment}
` as unknown as TypedDocumentNode<PersonsQueryWithFragment, void>;

export const PersonDocumentWithFragment = gql`
  query Person($id: Int!) {
    person(id: $id) {
      id
      tags {
        name
      }
      ...PersonChunk
    }
  }
  ${PersonChunkFragment}
` as unknown as TypedDocumentNode<PersonQueryWithFragment, PersonVariablesType>;

export const ChangePersonMutationDocument = gql`
  mutation ChangePerson($input: PersonInput!) {
    changePerson(input: $input) {
      id
      name
      tags {
        name
      }
      address {
        id
        ... on Prefecture {
          name
        }
        ... on City {
          name
          prefecture {
            id
            name
          }
        }
      }
    }
  }
` as unknown as TypedDocumentNode<
  ChangePersonMutation,
  ChangePersonVariablesType
>;

export const possibleTypes: PossibleTypesMap = {
  Location: ['Prefecture', 'City'],
};
