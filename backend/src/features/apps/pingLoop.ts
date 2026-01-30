import type { FastifyInstance } from 'fastify';
import { AppsService } from './service.js';
import { checkUrl } from './statusChecker.js';

export function registerAppsPingLoop(app: FastifyInstance) {
  const store = new Map<string, 'online' | 'offline' | 'unknown'>();
  (app as any).appsStatusStore = store;

  const service = new AppsService(app.dbPool);
  const intervalMs = Math.max(5_000, app.config.appsPingIntervalSec * 1000);
  const timeoutMs = Math.max(500, app.config.appsPingTimeoutMs);

  let timer: NodeJS.Timeout | undefined;
  let running = false;

  async function tick() {
    if (running) return;
    running = true;

    try {
      const rows = await service.listRows();
      await Promise.all(
        rows.map(async (r) => {
          const res = await checkUrl(r.url, timeoutMs);
          store.set(r.id, res.ok ? 'online' : 'offline');
        })
      );
    } catch (err) {
      app.log.warn({ err }, 'apps_ping_loop_failed');
    } finally {
      running = false;
    }
  }

  // Run once at startup then every interval
  void tick();
  timer = setInterval(tick, intervalMs);

  app.addHook('onClose', async () => {
    if (timer) clearInterval(timer);
  });
}
