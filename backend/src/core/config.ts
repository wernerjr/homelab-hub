export type AppConfig = {
  host: string;
  port: number;
  corsOrigin: string;
  staticDir?: string;
  serverName: string;
  databaseUrl: string;
  metricsMode: 'mock' | 'real' | 'auto';
  diskMount: string;
  appsPingIntervalSec: number;
  appsPingTimeoutMs: number;
};

export function getConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const host = env.HOST ?? '0.0.0.0';
  const port = Number(env.PORT ?? 8080);
  if (!Number.isFinite(port) || port <= 0) throw new Error('Invalid PORT');

  const corsOrigin = env.CORS_ORIGIN ?? 'http://localhost:5173';
  const staticDir = env.STATIC_DIR;

  const serverName = env.SERVER_NAME ?? 'homelab';

  const databaseUrl = env.DATABASE_URL ?? 'postgres://promptvault:promptvault@localhost:5432/promptvault';

  const metricsModeRaw = (env.METRICS_MODE ?? 'auto').toLowerCase();
  const metricsMode =
    metricsModeRaw === 'mock' || metricsModeRaw === 'real' || metricsModeRaw === 'auto'
      ? (metricsModeRaw as AppConfig['metricsMode'])
      : 'auto';

  const diskMount = env.DISK_MOUNT ?? '/';

  const appsPingIntervalSec = Number(env.APPS_PING_INTERVAL_SEC ?? 60);
  const appsPingTimeoutMs = Number(env.APPS_PING_TIMEOUT_MS ?? 3000);

  return {
    host,
    port,
    corsOrigin,
    staticDir,
    serverName,
    databaseUrl,
    metricsMode,
    diskMount,
    appsPingIntervalSec,
    appsPingTimeoutMs
  };
}
