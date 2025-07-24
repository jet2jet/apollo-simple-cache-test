import type { RequestHandler } from 'msw';
import { mockLocationsQueryDefault } from './mockLocation.mjs';
import {
  mockChangePersonMutationDefault,
  mockPersonQueryDefault,
  mockPersonsQueryDefault,
} from './mockPerson.mjs';

const mswHandlers: RequestHandler[] = [
  mockPersonsQueryDefault,
  mockPersonQueryDefault,
  mockChangePersonMutationDefault,
  mockLocationsQueryDefault,
];
export default mswHandlers;
