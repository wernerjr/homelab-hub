import t from 'tap';
import { buildApp } from '../src/app.js';

t.test('GET /api/apps returns apps list', async (t) => {
  const app = await buildApp({ host: '127.0.0.1', port: 0, corsOrigin: 'http://localhost:5173' });
  t.teardown(() => app.close());

  const res = await app.inject({ method: 'GET', url: '/api/apps' });
  t.equal(res.statusCode, 200);

  const body = res.json();
  t.ok(Array.isArray(body));
  t.ok(body.length >= 1);
  t.ok(body[0].id);
});
