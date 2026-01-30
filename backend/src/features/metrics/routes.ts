import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { MetricsSchema } from './schemas.js';
import { MetricsService } from './service.js';

export const metricsRoutes: FastifyPluginAsync = async (app) => {
  const service = new MetricsService({
    mode: app.config.metricsMode,
    diskMount: app.config.diskMount
  });
  const f = app.withTypeProvider<ZodTypeProvider>();

  f.get(
    '/',
    {
      schema: {
        response: {
          200: MetricsSchema
        }
      }
    },
    async () => {
      return service.snapshot();
    }
  );
};
