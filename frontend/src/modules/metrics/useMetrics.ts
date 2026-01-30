import { useEffect, useMemo, useState } from 'react';
import type { Metrics } from './types';

type MetricsHistory = {
  cpu: number[];
  memUsedPct: number[];
  diskUsedPct: number[];
  rx: number[];
  tx: number[];
};

const MAX_POINTS = 24;

export function useMetrics({ intervalMs = 12_000 }: { intervalMs?: number } = {}) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [history, setHistory] = useState<MetricsHistory>({
    cpu: [],
    memUsedPct: [],
    diskUsedPct: [],
    rx: [],
    tx: []
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let timer: number | undefined;

    async function tick() {
      try {
        const res = await fetch('/api/metrics');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Metrics;

        if (!alive) return;
        setMetrics(data);

        const memUsedPct = (data.memory.usedBytes / Math.max(1, data.memory.totalBytes)) * 100;
        setHistory((h) => ({
          cpu: [...h.cpu, data.cpu.usagePct].slice(-MAX_POINTS),
          memUsedPct: [...h.memUsedPct, memUsedPct].slice(-MAX_POINTS),
          diskUsedPct: [...h.diskUsedPct, data.disk.usedPct].slice(-MAX_POINTS),
          rx: [...h.rx, data.network.rxBytesPerSec].slice(-MAX_POINTS),
          tx: [...h.tx, data.network.txBytesPerSec].slice(-MAX_POINTS)
        }));

        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Erro ao carregar métricas');
      } finally {
        if (!alive) return;
        timer = window.setTimeout(tick, intervalMs);
      }
    }

    tick();
    return () => {
      alive = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [intervalMs]);

  const lastUpdated = useMemo(() => {
    if (!metrics) return null;
    return new Date(metrics.ts);
  }, [metrics]);

  return { metrics, history, error, lastUpdated };
}
