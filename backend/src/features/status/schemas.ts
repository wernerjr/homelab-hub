import { z } from 'zod';

export const StatusSchema = z.object({
  serverName: z.string().min(1),
  hostname: z.string().min(1),
  uptimeSec: z.number().nonnegative(),
  now: z.string().datetime()
});
