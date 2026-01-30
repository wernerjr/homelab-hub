import { useState } from 'react';
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

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {status?.serverName ?? 'homelab'}
              </h1>
              <Badge tone={overallTone}>status {metrics ? 'ok' : '…'}</Badge>
              {status?.hostname && <Badge tone="neutral">{status.hostname}</Badge>}
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Dashboard único do seu homelab — atalhos + métricas em quase tempo real.
            </p>
          </div>

          <div className="text-xs text-zinc-500">
            {lastUpdated ? `Atualizado: ${lastUpdated.toLocaleTimeString()}` : 'Carregando…'}
          </div>
        </header>

        <MetricsCards metrics={metrics} history={history} error={metricsError} />

        <div className="mt-6 sm:mt-8">
          <Card
            title="Favoritos"
            right={<Badge tone="neutral">{favorites.length}</Badge>}
          >
            {favoriteApps.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Nenhum favorito ainda. Passe o mouse em um app e clique na estrela.
              </p>
            ) : (
              <AppGrid apps={favoriteApps} favoritesSet={favoritesSet} onToggleFavorite={toggle} />
            )}
          </Card>
        </div>

        <div className="mt-6 sm:mt-8">
          <Card
            title="Apps"
            right={
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar…"
                  className="w-40 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/20"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-white/20"
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
              <AppGrid apps={otherApps} favoritesSet={favoritesSet} onToggleFavorite={toggle} />
            )}
          </Card>
        </div>

        <div className="mt-6 sm:mt-8">
          <Card title="Gerenciar apps">
            <ManageApps apps={apps} onChanged={reload} />
          </Card>
        </div>

        <footer className="mt-8 text-xs text-zinc-600">
          /api/apps · /api/metrics
        </footer>
      </div>
    </div>
  );
}
