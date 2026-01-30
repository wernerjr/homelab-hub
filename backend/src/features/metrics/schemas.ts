import { z } from 'zod';

export const CpuSchema = z.object({
  usagePct: z.number().min(0).max(100),
  avg1mPct: z.number().min(0).max(100),
  perCorePct: z.array(z.number().min(0).max(100))
});

export const MemorySchema = z.object({
  totalBytes: z.number().int().nonnegative(),
  usedBytes: z.number().int().nonnegative(),
  freeBytes: z.number().int().nonnegative()
});

export const DiskSchema = z.object({
  mount: z.string().min(1),
  totalBytes: z.number().int().nonnegative(),
  usedBytes: z.number().int().nonnegative(),
  usedPct: z.number().min(0).max(100)
});

export const NetworkSchema = z.object({
  rxBytesPerSec: z.number().nonnegative(),
  txBytesPerSec: z.number().nonnegative()
});

export const MetricsSchema = z.object({
  ts: z.string().datetime(),
  cpu: CpuSchema,
  memory: MemorySchema,
  disk: DiskSchema,
  network: NetworkSchema
});
