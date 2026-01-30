import type { z } from 'zod';
import type { DbPool } from '../../core/db.js';
import { AppCreateSchema, AppSchema, AppUpdateSchema, AppStatusSchema } from './schemas.js';

export type App = z.infer<typeof AppSchema>;
export type AppCreate = z.infer<typeof AppCreateSchema>;
export type AppUpdate = z.infer<typeof AppUpdateSchema>;
export type AppStatus = z.infer<typeof AppStatusSchema>;

export type AppRow = {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
};

export class AppsService {
  constructor(private pool: DbPool) {}

  async listRows(): Promise<AppRow[]> {
    const res = await this.pool.query(
      `select id, name, category, url, description
       from homelab_apps
       order by category asc, name asc`
    );
    return res.rows as AppRow[];
  }

  async create(input: AppCreate): Promise<AppRow> {
    const res = await this.pool.query(
      `insert into homelab_apps (name, category, url, description)
       values ($1, $2, $3, $4)
       returning id, name, category, url, description`,
      [input.name, input.category, input.url, input.description]
    );
    return res.rows[0] as AppRow;
  }

  async update(id: string, patch: AppUpdate): Promise<AppRow | null> {
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
    if (patch.description !== undefined) set('description', patch.description);

    if (fields.length === 0) {
      const cur = await this.pool.query(
        `select id, name, category, url, description
         from homelab_apps
         where id = $1`,
        [id]
      );
      return (cur.rows[0] as AppRow) ?? null;
    }

    values.push(id);

    const res = await this.pool.query(
      `update homelab_apps
       set ${fields.join(', ')}, updated_at = now()
       where id = $${i}
       returning id, name, category, url, description`,
      values
    );

    return (res.rows[0] as AppRow) ?? null;
  }

  async remove(id: string): Promise<boolean> {
    const res = await this.pool.query(`delete from homelab_apps where id = $1`, [id]);
    return res.rowCount === 1;
  }
}
