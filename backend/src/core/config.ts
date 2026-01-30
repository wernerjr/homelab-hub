export type AppConfig = {
  host: string;
  port: number;
  corsOrigin: string;
  staticDir?: string;
  serverName: string;
  appsFile?: string;
  metricsMode: 'mock' | 'real' | 'auto';
  diskMount: string;
};

export function getConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const host = env.HOST ?? '0.0.0.0';
  const port = Number(env.PORT ?? 8080);
  if (!Number.isFinite(port) || port <= 0) throw new Error('Invalid PORT');

  const corsOrigin = env.CORS_ORIGIN ?? 'http://localhost:5173';
  const staticDir = env.STATIC_DIR;

  const serverName = env.SERVER_NAME ?? 'homelab';

  const metricsModeRaw = (env.METRICS_MODE ?? 'auto').toLowerCase();
  const metricsMode =
    metricsModeRaw === 'mock' || metricsModeRaw === 'real' || metricsModeRaw === 'auto'
      ? (metricsModeRaw as AppConfig['metricsMode'])
      : 'auto';

  const appsFile = env.APPS_FILE;

  const diskMount = env.DISK_MOUNT ?? '/';

  return { host, port, corsOrigin, staticDir, serverName, appsFile, metricsMode, diskMount };
}
