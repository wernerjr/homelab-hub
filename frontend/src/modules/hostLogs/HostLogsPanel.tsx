import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { useHostLogs } from './useHostLogs';

export function HostLogsPanel() {
  const [unit, setUnit] = useState('');
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState<'poll' | 'stream'>('stream');

  const { data, error } = useHostLogs({ lines: 250, intervalMs: 5000, unit: unit.trim() || undefined });

  const [streamLines, setStreamLines] = useState<string[]>([]);
  const esRef = useRef<EventSource | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const displayLines = mode === 'poll' ? data?.lines ?? [] : streamLines;

  const text = useMemo(() => displayLines.join('\n'), [displayLines]);

  // Streaming (SSE)
  useEffect(() => {
    if (mode !== 'stream') return;
    if (paused) return;

    // reset on mode/unit change
    setStreamLines([]);

    const qs = new URLSearchParams();
    if (unit.trim()) qs.set('unit', unit.trim());

    const es = new EventSource(`/api/host-logs/stream?${qs.toString()}`);
    esRef.current = es;

    es.onmessage = (ev) => {
      setStreamLines((prev) => {
        const next = [...prev, ev.data];
        return next.slice(-800);
      });
    };

    es.addEventListener('error', () => {
      // browser will auto-retry; keep UI stable
    });

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [mode, unit, paused]);

  // Autoscroll when streaming and not paused
  useEffect(() => {
    if (mode !== 'stream') return;
    if (paused) return;
    const el = boxRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [mode, paused, streamLines.length]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">host logs</Badge>
        <Badge tone="neutral">journalctl</Badge>

        <input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="unit (ex: docker.service)"
          className="w-56 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/20"
        />

        <button
          type="button"
          onClick={() => setMode((m) => (m === 'stream' ? 'poll' : 'stream'))}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-100 hover:bg-white/10"
        >
          {mode === 'stream' ? 'Modo: stream' : 'Modo: poll'}
        </button>

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className={`rounded-lg border px-3 py-1.5 text-xs ${
            paused
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
              : 'border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10'
          }`}
        >
          {paused ? 'Pausado' : 'Ao vivo'}
        </button>

        {error && <Badge tone="bad">{error}</Badge>}
      </div>

      <div
        ref={boxRef}
        className="max-h-[65vh] overflow-auto rounded-2xl border border-white/10 bg-black/40 p-3 font-mono text-xs leading-relaxed text-zinc-200"
      >
        {text || 'Carregando…'}
      </div>

      <p className="text-xs text-zinc-500">
        Fonte: journald do host (journalctl dentro do container via mounts read-only).
      </p>
    </div>
  );
}
