import { z } from 'zod';

export const HostLogsQuerySchema = z.object({
  lines: z.coerce.number().int().min(10).max(2000).default(200),
  unit: z.string().min(1).optional()
});

export const HostLogsStreamQuerySchema = z.object({
  unit: z.string().min(1).optional()
});

export const HostLogsResponseSchema = z.object({
  source: z.literal('journalctl'),
  lines: z.array(z.string())
});
