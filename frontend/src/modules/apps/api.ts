import type { HomelabApp } from './types';

type AppCreate = Omit<HomelabApp, 'id'>;

type AppUpdate = Partial<Omit<HomelabApp, 'id'>>;

export async function createApp(input: AppCreate) {
  const res = await fetch('/api/apps', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as HomelabApp;
}

export async function updateApp(id: string, patch: AppUpdate) {
  const res = await fetch(`/api/apps/${id}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(patch)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as HomelabApp;
}

export async function deleteApp(id: string) {
  const res = await fetch(`/api/apps/${id}`, { method: 'DELETE' });
  if (res.status === 204) return;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
