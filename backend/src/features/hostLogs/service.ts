import { spawn } from 'node:child_process';

export class HostLogsService {
  async tailJournal(opts: { lines: number; unit?: string }): Promise<string[]> {
    const args: string[] = ['--no-pager', '--output=short-iso', `-n`, String(opts.lines)];
    if (opts.unit) {
      args.unshift(`--unit=${opts.unit}`);
    }

    const child = spawn('journalctl', args, { stdio: ['ignore', 'pipe', 'pipe'] });

    const out: Buffer[] = [];
    const err: Buffer[] = [];

    return await new Promise((resolve, reject) => {
      child.stdout.on('data', (d) => out.push(Buffer.from(d)));
      child.stderr.on('data', (d) => err.push(Buffer.from(d)));
      child.on('error', reject);
      child.on('close', (code) => {
        if (code !== 0) {
          const msg = Buffer.concat(err).toString('utf8') || `journalctl failed with code ${code}`;
          return reject(new Error(msg.trim()));
        }
        const text = Buffer.concat(out).toString('utf8');
        const lines = text
          .split('\n')
          .map((l) => l.trimEnd())
          .filter(Boolean);
        resolve(lines);
      });
    });
  }

  streamJournal(opts: { unit?: string }) {
    const args: string[] = ['--no-pager', '--output=short-iso', '-f', '-n', '0'];
    if (opts.unit) {
      args.unshift(`--unit=${opts.unit}`);
    }
    const child = spawn('journalctl', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    return child;
  }
}
