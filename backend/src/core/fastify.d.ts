import 'fastify';
import type { AppConfig } from './config.js';
import type { DbPool } from './db.js';

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig;
    dbPool: DbPool;
  }
}
