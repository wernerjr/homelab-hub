import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { AppsListSchema } from './schemas.js';
import { AppsService, defaultApps } from './service.js';
import { AppsStorage } from './storage.js';

export const appsRoutes: FastifyPluginAsync = async (app) => {
  const storage = new AppsStorage({ filePath: app.config.appsFile });
  const service = new AppsService({
    list: () => storage.list(defaultApps)
  });
  const f = app.withTypeProvider<ZodTypeProvider>();

  f.get(
    '/',
    {
      schema: {
        response: {
          200: AppsListSchema
        }
      }
    },
    async () => {
      return service.list();
    }
  );
};
