import type { z } from 'zod';
import type { DbPool } from '../../core/db.js';
import { AppCreateSchema, AppSchema, AppUpdateSchema } from './schemas.js';

export type App = z.infer<typeof AppSchema>;
export type AppCreate = z.infer<typeof AppCreateSchema>;
export type AppUpdate = z.infer<typeof AppUpdateSchema>;

export class AppsService {
  constructor(private pool: DbPool) {}

  async list(): Promise<App[]> {
    const res = await this.pool.query(
      `select id, name, category, url, status, description
       from homelab_apps
       order by category asc, name asc`
    );
    return res.rows as App[];
  }

  async create(input: AppCreate): Promise<App> {
    const res = await this.pool.query(
      `insert into homelab_apps (name, category, url, status, description)
       values ($1, $2, $3, $4, $5)
       returning id, name, category, url, status, description`,
      [input.name, input.category, input.url, input.status, input.description]
    );
    return res.rows[0] as App;
  }

  async update(id: string, patch: AppUpdate): Promise<App | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    const set = (col: string, v: unknown) => {
      fields.push(`${col} = $${i++}`);
      values.push(v);
    };

    if (patch.name !== undefined) set('name', patch.name);
    if (patch.category !== undefined) set('category', patch.category);
    if (patch.url !== undefined) set('url', patch.url);
    if (patch.status !== undefined) set('status', patch.status);
    if (patch.description !== undefined) set('description', patch.description);

    if (fields.length === 0) {
      const cur = await this.pool.query(
        `select id, name, category, url, status, description
         from homelab_apps
         where id = $1`,
        [id]
      );
      return (cur.rows[0] as App) ?? null;
    }

    values.push(id);

    const res = await this.pool.query(
      `update homelab_apps
       set ${fields.join(', ')}, updated_at = now()
       where id = $${i}
       returning id, name, category, url, status, description`,
      values
    );

    return (res.rows[0] as App) ?? null;
  }

  async remove(id: string): Promise<boolean> {
    const res = await this.pool.query(`delete from homelab_apps where id = $1`, [id]);
    return res.rowCount === 1;
  }
}
