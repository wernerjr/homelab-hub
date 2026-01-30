import { useEffect, useState } from 'react';
import type { Status } from './types';

export function useStatus() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const res = await fetch('/api/status');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Status;
        if (alive) setStatus(data);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Erro ao carregar status');
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  return { status, error };
}
