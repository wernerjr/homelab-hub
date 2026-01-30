import { buildApp } from './app.js';
import { getConfig } from './core/config.js';

const config = getConfig();
const app = await buildApp(config);

try {
  await app.listen({ host: config.host, port: config.port });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
