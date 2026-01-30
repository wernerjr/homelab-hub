import type { AppStatus } from './service.js';

export type CheckResult = {
  status: AppStatus;
  checkedAt: number;
  lastOkAt?: number;
  lastError?: string;
};

export type StatusStore = {
  get: (id: string) => CheckResult | undefined;
  set: (id: string, v: CheckResult) => void;
};

export function createStatusStore(): StatusStore {
  const map = new Map<string, CheckResult>();
  return {
    get: (id) => map.get(id),
    set: (id, v) => map.set(id, v)
  };
}

export async function checkUrl(url: string, timeoutMs: number): Promise<{ ok: boolean; statusCode?: number; error?: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    // Prefer HEAD; fallback to GET if not allowed.
    let res: Response | null = null;
    try {
      res = await fetch(url, { method: 'HEAD', signal: ctrl.signal, redirect: 'follow' });
    } catch {
      // ignore and retry with GET
    }

    if (!res) {
      res = await fetch(url, { method: 'GET', signal: ctrl.signal, redirect: 'follow' });
    }

    const statusCode = res.status;
    const ok = statusCode >= 200 && statusCode < 400;
    return { ok, statusCode };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'request_failed';
    return { ok: false, error: msg };
  } finally {
    clearTimeout(t);
  }
}
