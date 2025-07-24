import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
  type GraphQLFieldConfig,
  GraphQLInterfaceType,
  type GraphQLNamedType,
  GraphQLInputObjectType,
  getIntrospectionQuery,
  graphql,
  type IntrospectionQuery,
} from 'graphql';
import type {
  LocationType,
  MutationType,
  PersonInputType,
  PersonType,
  QueryType,
} from './types.mjs';

const LocationType = new GraphQLInterfaceType({
  name: 'Location',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const PrefectureType = new GraphQLObjectType({
  name: 'Prefecture',
  interfaces: [LocationType],
  fields: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const CityType = new GraphQLObjectType({
  name: 'City',
  interfaces: [LocationType],
  fields: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    prefecture: { type: new GraphQLNonNull(PrefectureType) },
  },
});

const TagType = new GraphQLObjectType({
  name: 'Tag',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    tags: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TagType))),
    },
    address: { type: LocationType },
  },
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    persons: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PersonType))),
    },
    person: {
      type: PersonType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
    },
    locations: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(LocationType))
      ),
    },
    location: {
      type: LocationType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
    },
    locationNames: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(GraphQLString))
      ),
    },
  } satisfies Record<
    Exclude<keyof QueryType, '__typename'>,
    GraphQLFieldConfig<unknown, unknown>
  >,
});

const PersonInputType = new GraphQLInputObjectType({
  name: 'PersonInput',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLString },
  },
});

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    changePerson: {
      type: PersonType,
      args: {
        input: {
          type: new GraphQLNonNull(PersonInputType),
        },
      },
    },
  } satisfies Record<
    Exclude<keyof MutationType, '__typename'>,
    GraphQLFieldConfig<unknown, unknown>
  >,
});

const types: GraphQLNamedType[] = [
  LocationType,
  PrefectureType,
  CityType,
  TagType,
  PersonType,
  QueryType,
  PersonInputType,
  MutationType,
];

const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  types,
});

export default schema;

async function createIntrospectionData() {
  const source = getIntrospectionQuery();
  const { data } = await graphql({ schema, source });
  return data as unknown as IntrospectionQuery;
}

export const introspectionData = await createIntrospectionData();
