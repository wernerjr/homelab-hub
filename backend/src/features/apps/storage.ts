import { promises as fs } from 'node:fs';
import type { App } from './service.js';
import { AppsListSchema } from './schemas.js';

export class AppsStorage {
  private filePath?: string;
  private cache?: { mtimeMs: number; apps: App[] };

  constructor(opts?: { filePath?: string }) {
    this.filePath = opts?.filePath;
  }

  async list(defaultApps: App[]): Promise<App[]> {
    if (!this.filePath) return defaultApps;

    try {
      const st = await fs.stat(this.filePath);
      if (this.cache && this.cache.mtimeMs === st.mtimeMs) return this.cache.apps;

      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed = AppsListSchema.parse(JSON.parse(raw));
      this.cache = { mtimeMs: st.mtimeMs, apps: parsed };
      return parsed;
    } catch {
      // If file not found/invalid, fall back to defaults
      return defaultApps;
    }
  }
}
