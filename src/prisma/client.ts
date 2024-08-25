import { PrismaClient } from '@prisma/client';
import logger from '../logger/logger';
// Prisma client setup
export const prismaClient = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'error' },
  ],
  errorFormat: 'pretty',
});
// Prisma client listeners
prismaClient.$on('query', (e) => {
  logger.info(`Query: ${e.query} Params: ${e.params}`);
});
prismaClient.$on('info', (e) => {
  logger.info(`Info: ${e.message}`);
});
prismaClient.$on('error', (e) => {
  logger.error(`ERROR: ${e.message}`);
});
