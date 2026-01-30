import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { HostLogsQuerySchema, HostLogsResponseSchema } from './schemas.js';
import { HostLogsService } from './service.js';

export const hostLogsRoutes: FastifyPluginAsync = async (app) => {
  const service = new HostLogsService();
  const f = app.withTypeProvider<ZodTypeProvider>();

  f.get(
    '/',
    {
      schema: {
        querystring: HostLogsQuerySchema,
        response: {
          200: HostLogsResponseSchema
        }
      }
    },
    async (req) => {
      const lines = await service.tailJournal(req.query);
      return { source: 'journalctl' as const, lines };
    }
  );
};
