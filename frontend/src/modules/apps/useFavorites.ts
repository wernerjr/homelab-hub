import { useEffect, useMemo, useState } from 'react';

const KEY = 'homelab-hub:favorites:v1';

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, [ids]);

  const set = useMemo(() => new Set(ids), [ids]);

  function toggle(id: string) {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return { favorites: ids, favoritesSet: set, toggle };
}
