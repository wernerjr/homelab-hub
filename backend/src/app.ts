import path from 'node:path';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import type { AppConfig } from './core/config.js';
import { createPool } from './core/db.js';
import { bootstrapDb } from './core/bootstrap.js';
import { appsRoutes } from './features/apps/routes.js';
import { metricsRoutes } from './features/metrics/routes.js';
import { statusRoutes } from './features/status/routes.js';

export async function buildApp(config: AppConfig, opts?: { skipDb?: boolean }) {
  const app = Fastify({
    logger: true
  });

  app.decorate('config', config);

  if (opts?.skipDb) {
    // Minimal mock for tests
    app.decorate('dbPool', {
      query: async () => ({ rows: [], rowCount: 0 })
    } as any);
  } else {
    const pool = createPool(config.databaseUrl);
    app.decorate('dbPool', pool);
    await bootstrapDb(pool);
    app.addHook('onClose', async () => {
      await pool.end();
    });
  }

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cors, {
    origin: config.corsOrigin,
    credentials: true
  });

  await app.register(statusRoutes, { prefix: '/api/status' });
  await app.register(appsRoutes, { prefix: '/api/apps' });
  await app.register(metricsRoutes, { prefix: '/api/metrics' });

  // Serve SPA (built frontend) from the backend in production
  if (config.staticDir) {
    const root = path.resolve(config.staticDir);

    await app.register(fastifyStatic, {
      root,
      prefix: '/',
      decorateReply: false
    });

    app.setNotFoundHandler(async (req, reply) => {
      // Let API 404 naturally
      if (req.url.startsWith('/api/')) return reply.code(404).send({ message: 'Not Found' });
      return reply.sendFile('index.html');
    });
  }

  return app;
}
