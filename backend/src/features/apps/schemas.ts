import { z } from 'zod';

export const AppStatusSchema = z.enum(['online', 'offline', 'unknown']);

export const AppSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  category: z.string().min(1),
  url: z.string().url(),
  status: AppStatusSchema,
  description: z.string().min(1)
});

export const AppsListSchema = z.array(AppSchema);

export const AppCreateSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  url: z.string().url(),
  status: AppStatusSchema.default('unknown'),
  description: z.string().min(1)
});

export const AppUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    url: z.string().url().optional(),
    status: AppStatusSchema.optional(),
    description: z.string().min(1).optional()
  })
  .partial();

export const AppIdParamSchema = z.object({
  id: z.string().uuid()
});

export const ErrorMessageSchema = z.object({
  message: z.string()
});
