import { setupServer } from 'msw/node';
import mswHandlers from './mswHandlers.mjs';

export const server = setupServer(...mswHandlers);
