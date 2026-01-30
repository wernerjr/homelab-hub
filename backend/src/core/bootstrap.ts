import type { DbPool } from './db.js';

export async function bootstrapDb(pool: DbPool) {
  await pool.query('create extension if not exists pgcrypto');

  await pool.query(`
    create table if not exists homelab_apps (
      id uuid primary key default gen_random_uuid(),
      name varchar(255) not null,
      category varchar(255) not null,
      url text not null,
      description text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);

  // Drop old persisted status column (status is computed by ping now)
  await pool.query('alter table homelab_apps drop column if exists status');

  await pool.query('create index if not exists homelab_apps_category_idx on homelab_apps(category)');
  await pool.query('create index if not exists homelab_apps_name_idx on homelab_apps(name)');

  // Seed if empty
  const count = await pool.query('select count(*)::int as n from homelab_apps');
  const n = Number(count.rows[0]?.n ?? 0);
  if (n === 0) {
    await pool.query(
      `insert into homelab_apps (name, category, url, description)
       values
        ('Homelab Hub', 'Dashboard', 'http://192.168.15.100/', 'Dashboard principal (esta página).'),
        ('Portainer', 'Containers', 'http://192.168.15.100:9000/', 'UI para Docker e stacks (Portainer CE).'),
        ('Prompt Vault', 'Tools', 'http://192.168.15.100:3000/', 'App do Prompt Vault.')`
    );
  }
}
