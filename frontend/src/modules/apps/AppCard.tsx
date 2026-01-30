import { Badge } from '../../components/ui/Badge';
import type { HomelabApp } from './types';

function statusTone(status: HomelabApp['status']) {
  if (status === 'online') return 'good';
  if (status === 'offline') return 'bad';
  return 'neutral';
}

export function AppCard({
  app,
  favorite,
  onToggleFavorite
}: {
  app: HomelabApp;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <a
      href={app.url}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-2xl border border-white/10 bg-zinc-950/40 p-4 shadow-sm backdrop-blur transition hover:border-white/20 hover:bg-zinc-950/60"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-zinc-100">
              {app.name}
            </h3>
            <Badge tone={statusTone(app.status)}>{app.status}</Badge>
          </div>
          <p className="mt-1 truncate text-sm text-zinc-400">{app.category}</p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite();
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-200 opacity-0 transition group-hover:opacity-100 hover:bg-white/10"
          aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          title={favorite ? 'Favorito' : 'Favoritar'}
        >
          {favorite ? '★' : '☆'}
        </button>
      </div>

      <p className="text-sm text-zinc-300">
        {app.description.length > 90 ? `${app.description.slice(0, 90)}…` : app.description}
      </p>

      <p className="mt-3 truncate text-xs text-zinc-500">{app.url}</p>
    </a>
  );
}
