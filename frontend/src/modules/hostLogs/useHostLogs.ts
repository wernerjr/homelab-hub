import { useEffect, useState } from 'react';
import type { HostLogsResponse } from './types';

export function useHostLogs({
  lines = 200,
  unit,
  intervalMs = 5000
}: {
  lines?: number;
  unit?: string;
  intervalMs?: number;
} = {}) {
  const [data, setData] = useState<HostLogsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let timer: number | undefined;

    async function tick() {
      try {
        const qs = new URLSearchParams();
        qs.set('lines', String(lines));
        if (unit) qs.set('unit', unit);

        const res = await fetch(`/api/host-logs?${qs.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as HostLogsResponse;
        if (!alive) return;
        setData(json);
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Erro ao carregar logs');
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
  }, [lines, unit, intervalMs]);

  return { data, error };
}
