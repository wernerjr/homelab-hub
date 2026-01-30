import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { AppCreateSchema, AppIdParamSchema, AppsListSchema, AppSchema, AppUpdateSchema, ErrorMessageSchema } from './schemas.js';
import { AppsService } from './service.js';

export const appsRoutes: FastifyPluginAsync = async (app) => {
  const service = new AppsService(app.dbPool);
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

  f.post(
    '/',
    {
      schema: {
        body: AppCreateSchema,
        response: {
          201: AppSchema
        }
      }
    },
    async (req, reply) => {
      const created = await service.create(req.body);
      return reply.code(201).send(created);
    }
  );

  f.put(
    '/:id',
    {
      schema: {
        params: AppIdParamSchema,
        body: AppUpdateSchema,
        response: {
          200: AppSchema,
          404: ErrorMessageSchema
        }
      }
    },
    async (req, reply) => {
      const updated = await service.update(req.params.id, req.body);
      if (!updated) return reply.code(404).send({ message: 'Not Found' });
      return updated;
    }
  );

  f.delete(
    '/:id',
    {
      schema: {
        params: AppIdParamSchema,
        response: {
          204: ErrorMessageSchema.optional(),
          404: ErrorMessageSchema
        }
      }
    },
    async (req, reply) => {
      const ok = await service.remove(req.params.id);
      if (!ok) return reply.code(404).send({ message: 'Not Found' });
      return reply.code(204).send();
    }
  );
};
