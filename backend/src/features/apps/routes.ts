import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { AppCreateSchema, AppIdParamSchema, AppsListSchema, AppSchema, AppUpdateSchema, ErrorMessageSchema } from './schemas.js';
import { AppsService } from './service.js';

export const appsRoutes: FastifyPluginAsync = async (app) => {
  const service = new AppsService(app.dbPool);
  const f = app.withTypeProvider<ZodTypeProvider>();

  // in-memory status cache (computed by periodic pings)
  const statusStore = (app as any).appsStatusStore as Map<string, 'online' | 'offline' | 'unknown'> | undefined;

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
      const rows = await service.listRows();
      return rows.map((r) => ({
        ...r,
        status: statusStore?.get(r.id) ?? 'unknown'
      }));
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
      const createdRow = await service.create(req.body);
      return reply.code(201).send({ ...createdRow, status: 'unknown' });
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
      const updatedRow = await service.update(req.params.id, req.body);
      if (!updatedRow) return reply.code(404).send({ message: 'Not Found' });
      const statusStore = (app as any).appsStatusStore as Map<string, 'online' | 'offline' | 'unknown'> | undefined;
      return { ...updatedRow, status: statusStore?.get(updatedRow.id) ?? 'unknown' };
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
