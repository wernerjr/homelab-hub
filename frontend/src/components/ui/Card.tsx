import type { ReactNode } from 'react';

export function Card({
  title,
  right,
  children
}: {
  title?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 shadow-sm backdrop-blur">
      {(title || right) && (
        <header className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
            {title}
          </h2>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}
