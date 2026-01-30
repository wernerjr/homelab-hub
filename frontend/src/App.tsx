import { useMemo, useState } from 'react';
import { HostLogsPanel } from './modules/hostLogs/HostLogsPanel';
import { Card } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { AppGrid } from './modules/apps/AppGrid';
import { ManageApps } from './modules/apps/ManageApps';
import { useApps } from './modules/apps/useApps';
import { useFavorites } from './modules/apps/useFavorites';
import { MetricsCards } from './modules/metrics/MetricsCards';
import { useMetrics } from './modules/metrics/useMetrics';
import { useStatus } from './modules/status/useStatus';

export default function App() {
  const { status } = useStatus();
  const { apps, loading, error, reload } = useApps();
  const { favoritesSet, toggle, favorites } = useFavorites();

  const { metrics, history, lastUpdated, error: metricsError } = useMetrics({
    intervalMs: 12_000
  });

  const [tab, setTab] = useState<'dashboard' | 'apps' | 'logs'>('dashboard');

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('');

  const categories = Array.from(new Set(apps.map((a) => a.category))).sort();

  const matches = (s: string) => s.toLowerCase().includes(query.trim().toLowerCase());

  const visible = apps.filter((a) => {
    const q = query.trim();
    const okQuery = !q || matches(a.name) || matches(a.category) || matches(a.description);
    const okCat = !category || a.category === category;
    return okQuery && okCat;
  });

  const favoriteApps = visible.filter((a) => favoritesSet.has(a.id));
  const otherApps = visible.filter((a) => !favoritesSet.has(a.id));

  const overallTone = metrics
    ? metrics.cpu.usagePct < 80 && metrics.disk.usedPct < 90
      ? 'good'
      : 'bad'
    : 'neutral';

  const tabItems = useMemo(
    () =>
      [
        { id: 'dashboard' as const, label: 'Dashboard' },
        { id: 'apps' as const, label: 'Apps' },
        { id: 'logs' as const, label: 'Logs' }
      ],
    []
  );

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      {/* content */}
      <div className="mx-auto max-w-6xl px-4 pt-5 pb-24 sm:pt-8 sm:pb-28">
        <header className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold tracking-tight sm:text-2xl">
                {status?.serverName ?? 'homelab'}
              </h1>
              <Badge tone={overallTone}>status {metrics ? 'ok' : '…'}</Badge>
              {status?.hostname && <Badge tone="neutral">{status.hostname}</Badge>}
            </div>
            <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
              Dashboard + apps + logs
            </p>
          </div>

          <div className="shrink-0 text-[11px] text-zinc-500 sm:text-xs">
            {lastUpdated ? `Atualizado: ${lastUpdated.toLocaleTimeString()}` : 'Carregando…'}
          </div>
        </header>

        {tab === 'dashboard' ? (
          <MetricsCards metrics={metrics} history={history} error={metricsError} />
        ) : tab === 'apps' ? (
          <>
            <div className="mt-4 sm:mt-6">
              <Card title="Favoritos" right={<Badge tone="neutral">{favorites.length}</Badge>}>
                {favoriteApps.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    Nenhum favorito ainda. Passe o mouse em um app e clique na estrela.
                  </p>
                ) : (
                  <AppGrid
                    apps={favoriteApps}
                    favoritesSet={favoritesSet}
                    onToggleFavorite={toggle}
                  />
                )}
              </Card>
            </div>

            <div className="mt-4 sm:mt-8">
              <Card
                title="Apps"
                right={
                  <div className="flex w-full flex-wrap items-center justify-end gap-2">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar…"
                      className="w-full max-w-[14rem] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/20"
                    />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full max-w-[10rem] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-white/20"
                    >
                      <option value="">Todas</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <Badge tone="neutral">{visible.length}</Badge>
                  </div>
                }
              >
                {loading && <p className="text-sm text-zinc-400">Carregando apps…</p>}
                {error && (
                  <p className="text-sm text-rose-200">Erro ao carregar apps: {error}</p>
                )}
                {!loading && !error && (
                  <AppGrid
                    apps={otherApps}
                    favoritesSet={favoritesSet}
                    onToggleFavorite={toggle}
                  />
                )}
              </Card>
            </div>

            <div className="mt-4 sm:mt-8">
              <Card title="Gerenciar apps">
                <ManageApps apps={apps} onChanged={reload} />
              </Card>
            </div>
          </>
        ) : (
          <Card title="Logs do host (journald)">
            <HostLogsPanel />
          </Card>
        )}

        <footer className="mt-6 text-[11px] text-zinc-600 sm:text-xs">
          /api/apps · /api/metrics
        </footer>
      </div>

      {/* bottom tabs (mobile-first) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-zinc-950/80 backdrop-blur"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}
      >
        <div className="mx-auto flex max-w-6xl px-2">
          {tabItems.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 px-2 py-3 text-xs ${
                tab === t.id ? 'text-zinc-100' : 'text-zinc-400'
              }`}
            >
              <span
                className={`h-1.5 w-8 rounded-full ${
                  tab === t.id ? 'bg-white/30' : 'bg-transparent'
                }`}
              />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
