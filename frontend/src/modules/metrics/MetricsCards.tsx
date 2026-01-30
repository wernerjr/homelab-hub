import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatBps, formatBytes } from './format';
import { Sparkline } from './Sparkline';
import type { Metrics } from './types';

export function MetricsCards({
  metrics,
  history,
  error
}: {
  metrics: Metrics | null;
  history: {
    cpu: number[];
    memUsedPct: number[];
    diskUsedPct: number[];
    rx: number[];
    tx: number[];
  };
  error: string | null;
}) {
  const memUsedPct = metrics
    ? (metrics.memory.usedBytes / Math.max(1, metrics.memory.totalBytes)) * 100
    : null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card
        title="CPU"
        right={
          <Badge tone={!metrics ? 'neutral' : metrics.cpu.usagePct < 70 ? 'good' : 'bad'}>
            {metrics ? `${metrics.cpu.usagePct.toFixed(1)}%` : '—'}
          </Badge>
        }
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-zinc-300">
            <div>Média 1m: {metrics ? `${metrics.cpu.avg1mPct.toFixed(1)}%` : '—'}</div>
            <div className="mt-1 text-xs text-zinc-500">
              Cores: {metrics ? metrics.cpu.perCorePct.map((x) => x.toFixed(0)).join('% · ') + '%' : '—'}
            </div>
          </div>
          <Sparkline points={history.cpu} />
        </div>
      </Card>

      <Card
        title="Memória"
        right={
          <Badge tone={memUsedPct == null ? 'neutral' : memUsedPct < 80 ? 'good' : 'bad'}>
            {memUsedPct == null ? '—' : `${memUsedPct.toFixed(1)}%`}
          </Badge>
        }
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-zinc-300">
            <div>
              {metrics
                ? `${formatBytes(metrics.memory.usedBytes)} / ${formatBytes(metrics.memory.totalBytes)}`
                : '—'}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              Livre: {metrics ? formatBytes(metrics.memory.freeBytes) : '—'}
            </div>
          </div>
          <Sparkline points={history.memUsedPct} />
        </div>
      </Card>

      <Card
        title="Disco"
        right={
          <Badge tone={!metrics ? 'neutral' : metrics.disk.usedPct < 85 ? 'good' : 'bad'}>
            {metrics ? `${metrics.disk.usedPct.toFixed(1)}%` : '—'}
          </Badge>
        }
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-zinc-300">
            <div>
              {metrics
                ? `${formatBytes(metrics.disk.usedBytes)} / ${formatBytes(metrics.disk.totalBytes)}`
                : '—'}
            </div>
            <div className="mt-1 text-xs text-zinc-500">Mount: {metrics ? metrics.disk.mount : '—'}</div>
          </div>
          <Sparkline points={history.diskUsedPct} />
        </div>
      </Card>

      <Card
        title="Rede"
        right={
          error ? (
            <Badge tone="bad">{error}</Badge>
          ) : (
            <Badge tone="neutral">{metrics ? 'ao vivo' : '—'}</Badge>
          )
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-zinc-500">RX</div>
            <div className="mt-1 text-sm font-semibold text-zinc-100">
              {metrics ? formatBps(metrics.network.rxBytesPerSec) : '—'}
            </div>
            <div className="mt-2">
              <Sparkline points={history.rx} stroke="rgba(56,189,248,0.85)" />
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-zinc-500">TX</div>
            <div className="mt-1 text-sm font-semibold text-zinc-100">
              {metrics ? formatBps(metrics.network.txBytesPerSec) : '—'}
            </div>
            <div className="mt-2">
              <Sparkline points={history.tx} stroke="rgba(34,197,94,0.85)" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
