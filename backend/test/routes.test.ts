import t from 'tap';
import { buildApp } from '../src/app.js';

t.test('GET /api/apps returns apps list', async (t) => {
  const app = await buildApp(
    {
      host: '127.0.0.1',
      port: 0,
      corsOrigin: 'http://localhost:5173',
      staticDir: undefined,
      serverName: 'test',
      databaseUrl: 'postgres://invalid',
      metricsMode: 'mock',
      diskMount: '/'
    },
    { skipDb: true }
  );
  t.teardown(() => app.close());

  const res = await app.inject({ method: 'GET', url: '/api/apps' });
  t.equal(res.statusCode, 200);

  const body = res.json();
  t.ok(Array.isArray(body));
  t.ok(body.length >= 0);
});
