import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { HostLogsQuerySchema, HostLogsResponseSchema, HostLogsStreamQuerySchema } from './schemas.js';
import { HostLogsService } from './service.js';

export const hostLogsRoutes: FastifyPluginAsync = async (app) => {
  const service = new HostLogsService();
  const f = app.withTypeProvider<ZodTypeProvider>();

  f.get(
    '/',
    {
      schema: {
        querystring: HostLogsQuerySchema,
        response: {
          200: HostLogsResponseSchema
        }
      }
    },
    async (req) => {
      const lines = await service.tailJournal(req.query);
      return { source: 'journalctl' as const, lines };
    }
  );

  // Server-Sent Events stream
  f.get(
    '/stream',
    {
      schema: {
        querystring: HostLogsStreamQuerySchema
      }
    },
    async (req, reply) => {
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive'
      });

      const child = service.streamJournal(req.query);

      const writeLine = (line: string) => {
        // SSE data: one event per line
        reply.raw.write(`data: ${line.replace(/\r?\n/g, ' ')}\n\n`);
      };

      // keep-alive ping
      const ping = setInterval(() => {
        reply.raw.write(`: ping\n\n`);
      }, 15000);

      let buf = '';
      child.stdout.on('data', (chunk: Buffer) => {
        buf += chunk.toString('utf8');
        const parts = buf.split('\n');
        buf = parts.pop() ?? '';
        for (const p of parts) {
          const line = p.trimEnd();
          if (line) writeLine(line);
        }
      });

      child.stderr.on('data', (chunk: Buffer) => {
        const msg = chunk.toString('utf8').trim();
        if (msg) reply.raw.write(`event: error\ndata: ${msg.replace(/\r?\n/g, ' ')}\n\n`);
      });

      const cleanup = () => {
        clearInterval(ping);
        child.kill('SIGTERM');
      };

      req.raw.on('close', cleanup);
      req.raw.on('aborted', cleanup);

      return reply;
    }
  );
};
