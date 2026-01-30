import os from 'node:os';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { StatusSchema } from './schemas.js';

export const statusRoutes: FastifyPluginAsync = async (app) => {
  const f = app.withTypeProvider<ZodTypeProvider>();

  f.get(
    '/',
    {
      schema: {
        response: {
          200: StatusSchema
        }
      }
    },
    async () => {
      return {
        serverName: app.config.serverName,
        hostname: os.hostname(),
        uptimeSec: Math.floor(process.uptime()),
        now: new Date().toISOString()
      };
    }
  );
};
