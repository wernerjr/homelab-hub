import type { HomelabApp } from './types';
import { AppCard } from './AppCard';

export function AppGrid({
  apps,
  favoritesSet,
  onToggleFavorite
}: {
  apps: HomelabApp[];
  favoritesSet: Set<string>;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {apps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          favorite={favoritesSet.has(app.id)}
          onToggleFavorite={() => onToggleFavorite(app.id)}
        />
      ))}
    </div>
  );
}
