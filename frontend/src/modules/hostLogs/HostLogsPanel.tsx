import { useMemo } from 'react';
import { Badge } from '../../components/ui/Badge';
import { useHostLogs } from './useHostLogs';

export function HostLogsPanel() {
  const { data, error } = useHostLogs({ lines: 250, intervalMs: 5000 });

  const text = useMemo(() => {
    if (!data) return '';
    return data.lines.join('\n');
  }, [data]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">host logs</Badge>
        <Badge tone="neutral">{data?.source ?? '—'}</Badge>
        {error && <Badge tone="bad">{error}</Badge>}
      </div>

      <div className="max-h-[60vh] overflow-auto rounded-2xl border border-white/10 bg-black/40 p-3 font-mono text-xs leading-relaxed text-zinc-200">
        {text || 'Carregando…'}
      </div>

      <p className="text-xs text-zinc-500">
        Fonte: journalctl dentro do container (montando /var/log/journal do host, read-only).
      </p>
    </div>
  );
}
