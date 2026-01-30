import { useMemo, useState } from 'react';
import type { HomelabApp } from './types';
import { createApp, deleteApp, updateApp } from './api';
import { Badge } from '../../components/ui/Badge';

type Draft = {
  name: string;
  category: string;
  url: string;
  status: HomelabApp['status'];
  description: string;
};

const emptyDraft: Draft = {
  name: '',
  category: '',
  url: '',
  status: 'unknown',
  description: ''
};

export function ManageApps({
  apps,
  onChanged
}: {
  apps: HomelabApp[];
  onChanged: () => Promise<void>;
}) {
  const [mode, setMode] = useState<'create' | 'edit' | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const selected = useMemo(
    () => apps.find((a) => a.id === selectedId) ?? null,
    [apps, selectedId]
  );

  function startCreate() {
    setErr(null);
    setMode('create');
    setSelectedId('');
    setDraft(emptyDraft);
  }

  function startEdit(id: string) {
    const a = apps.find((x) => x.id === id);
    if (!a) return;
    setErr(null);
    setMode('edit');
    setSelectedId(id);
    setDraft({
      name: a.name,
      category: a.category,
      url: a.url,
      status: a.status,
      description: a.description
    });
  }

  async function submit() {
    try {
      setBusy(true);
      setErr(null);
      if (mode === 'create') {
        await createApp(draft);
      } else if (mode === 'edit' && selected) {
        await updateApp(selected.id, draft);
      }
      setMode(null);
      await onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Excluir este app?')) return;
    try {
      setBusy(true);
      setErr(null);
      await deleteApp(id);
      if (selectedId === id) setMode(null);
      await onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={startCreate}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-100 hover:bg-white/10"
        >
          + Adicionar
        </button>
        <button
          type="button"
          onClick={() => onChanged()}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-100 hover:bg-white/10"
        >
          Recarregar
        </button>
        {err && <Badge tone="bad">{err}</Badge>}
        {busy && <Badge tone="neutral">trabalhando…</Badge>}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {apps.map((a) => (
          <div
            key={a.id}
            className="rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{a.name}</div>
                <div className="mt-0.5 truncate text-xs text-zinc-400">
                  {a.category} · {a.status}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(a.id)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-200 hover:bg-rose-500/15"
                >
                  Excluir
                </button>
              </div>
            </div>
            <div className="mt-2 truncate text-xs text-zinc-500">{a.url}</div>
          </div>
        ))}
      </div>

      {mode && (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">
              {mode === 'create' ? 'Adicionar app' : `Editar app: ${selected?.name ?? ''}`}
            </div>
            <button
              type="button"
              onClick={() => setMode(null)}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nome">
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/20"
              />
            </Field>
            <Field label="Categoria">
              <input
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/20"
              />
            </Field>
            <Field label="URL">
              <input
                value={draft.url}
                onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/20"
              />
            </Field>
            <Field label="Status">
              <select
                value={draft.status}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, status: e.target.value as Draft['status'] }))
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/20"
              >
                <option value="unknown">unknown</option>
                <option value="online">online</option>
                <option value="offline">offline</option>
              </select>
            </Field>
          </div>

          <div className="mt-3">
            <Field label="Descrição">
              <textarea
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                className="h-24 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/20"
              />
            </Field>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={submit}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-zinc-500">{label}</div>
      {children}
    </label>
  );
}
