import { z } from 'zod';

export const AppStatusSchema = z.enum(['online', 'offline', 'unknown']);

export const AppSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  url: z.string().url(),
  status: AppStatusSchema,
  description: z.string().min(1)
});

export const AppsListSchema = z.array(AppSchema);
