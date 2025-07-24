import { graphql, HttpResponse } from 'msw';
import {
  LocationsDocument,
  type LocationsQuery,
} from '../schema/documents.mjs';
import { locationsData } from './dummyData.mjs';

export const mockLocationsQueryDefault = graphql.query(
  LocationsDocument,
  () => {
    return HttpResponse.json<{ data: LocationsQuery }>({
      data: {
        __typename: 'Query',
        locations: locationsData,
      },
    });
  }
);
