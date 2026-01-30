import { useEffect, useState } from 'react';
import type { HomelabApp } from './types';

export function useApps() {
  const [apps, setApps] = useState<HomelabApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        const res = await fetch('/api/apps');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as HomelabApp[];
        if (alive) setApps(data);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Erro ao carregar apps');
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  return { apps, loading, error };
}
