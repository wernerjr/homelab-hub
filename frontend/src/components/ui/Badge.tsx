import type { ReactNode } from 'react';

export function Badge({
  tone = 'neutral',
  children
}: {
  tone?: 'good' | 'bad' | 'neutral';
  children: ReactNode;
}) {
  const cls =
    tone === 'good'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
      : tone === 'bad'
        ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
        : 'border-white/15 bg-white/5 text-zinc-200';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}
    >
      {children}
    </span>
  );
}
