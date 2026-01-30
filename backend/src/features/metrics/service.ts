import { promises as fs } from 'node:fs';
import type { z } from 'zod';
import { MetricsSchema } from './schemas.js';

export type Metrics = z.infer<typeof MetricsSchema>;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function jitter(prev: number, delta: number, min: number, max: number) {
  const next = prev + (Math.random() * 2 - 1) * delta;
  return clamp(next, min, max);
}

type MetricsState = {
  cpuAvg: number;
  perCore: number[];
  memUsedPct: number;
  diskUsedPct: number;
  rx: number;
  tx: number;
};

const mockState: MetricsState = {
  cpuAvg: 22,
  perCore: [18, 25, 20, 28],
  memUsedPct: 48,
  diskUsedPct: 61,
  rx: 180_000,
  tx: 120_000
};

type CpuTimes = { idle: number; total: number };

type RealState = {
  lastCpu?: { total: CpuTimes; cores: CpuTimes[] };
  lastNet?: { ts: number; rx: number; tx: number };
};

export class MetricsService {
  private mode: 'mock' | 'real' | 'auto';
  private diskMount: string;
  private real: RealState = {};

  constructor(opts?: { mode?: 'mock' | 'real' | 'auto'; diskMount?: string }) {
    this.mode = opts?.mode ?? 'auto';
    this.diskMount = opts?.diskMount ?? '/';
  }

  async snapshot(): Promise<Metrics> {
    const useReal = this.mode === 'real' || (this.mode === 'auto' && process.platform === 'linux');

    const metrics = useReal ? await this.snapshotReal().catch(() => this.snapshotMock()) : await this.snapshotMock();
    return MetricsSchema.parse(metrics);
  }

  private async snapshotMock(): Promise<Metrics> {
    // CPU
    mockState.cpuAvg = jitter(mockState.cpuAvg, 6, 0, 100);
    mockState.perCore = mockState.perCore.map((c) => jitter(c, 10, 0, 100));

    const usagePct = clamp(
      mockState.perCore.reduce((a, b) => a + b, 0) / Math.max(1, mockState.perCore.length),
      0,
      100
    );

    // Memory (simulate a host with 32GB)
    const totalBytes = 32 * 1024 * 1024 * 1024;
    mockState.memUsedPct = jitter(mockState.memUsedPct, 2.5, 10, 95);
    const usedBytes = Math.round((totalBytes * mockState.memUsedPct) / 100);
    const freeBytes = Math.max(0, totalBytes - usedBytes);

    // Disk (simulate a 2TB volume)
    const mount = this.diskMount;
    const diskTotalBytes = 2 * 1024 * 1024 * 1024 * 1024;
    mockState.diskUsedPct = jitter(mockState.diskUsedPct, 0.8, 10, 98);
    const diskUsedBytes = Math.round((diskTotalBytes * mockState.diskUsedPct) / 100);

    // Network (bytes/sec)
    mockState.rx = Math.round(jitter(mockState.rx, 80_000, 0, 5_000_000));
    mockState.tx = Math.round(jitter(mockState.tx, 60_000, 0, 5_000_000));

    return {
      ts: new Date().toISOString(),
      cpu: {
        usagePct: Number(usagePct.toFixed(1)),
        avg1mPct: Number(mockState.cpuAvg.toFixed(1)),
        perCorePct: mockState.perCore.map((c) => Number(c.toFixed(1)))
      },
      memory: { totalBytes, usedBytes, freeBytes },
      disk: {
        mount,
        totalBytes: diskTotalBytes,
        usedBytes: diskUsedBytes,
        usedPct: Number(mockState.diskUsedPct.toFixed(1))
      },
      network: { rxBytesPerSec: mockState.rx, txBytesPerSec: mockState.tx }
    };
  }

  private async snapshotReal(): Promise<Metrics> {
    // CPU from /proc/stat
    const stat = await fs.readFile('/proc/stat', 'utf8');
    const cpuLines = stat
      .split('\n')
      .filter((l) => l.startsWith('cpu'))
      .map((l) => l.trim());

    const parseCpuLine = (line: string): CpuTimes => {
      // cpu  user nice system idle iowait irq softirq steal guest guest_nice
      const parts = line.split(/\s+/);
      const nums = parts.slice(1).map((x) => Number(x));
      const idle = (nums[3] ?? 0) + (nums[4] ?? 0);
      const total = nums.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
      return { idle, total };
    };

    const totalTimes = parseCpuLine(cpuLines[0] ?? 'cpu 0 0 0 0 0 0 0 0');
    const coreTimes = cpuLines
      .slice(1)
      .filter((l) => /^cpu\d+\s/.test(l))
      .map(parseCpuLine);

    const prevCpu = this.real.lastCpu;
    this.real.lastCpu = { total: totalTimes, cores: coreTimes };

    const pctFromDelta = (prev: CpuTimes | undefined, cur: CpuTimes) => {
      if (!prev) return 0;
      const totalDelta = cur.total - prev.total;
      const idleDelta = cur.idle - prev.idle;
      if (totalDelta <= 0) return 0;
      return clamp(((totalDelta - idleDelta) / totalDelta) * 100, 0, 100);
    };

    const perCorePct = coreTimes.map((c, i) => pctFromDelta(prevCpu?.cores[i], c));
    const usagePct = pctFromDelta(prevCpu?.total, totalTimes);

    // Loadavg
    const loadavg = await fs.readFile('/proc/loadavg', 'utf8');
    const avg1 = Number(loadavg.trim().split(/\s+/)[0] ?? '0');
    const avg1mPct = clamp((avg1 / Math.max(1, perCorePct.length || 1)) * 100, 0, 100);

    // Memory from /proc/meminfo
    const meminfo = await fs.readFile('/proc/meminfo', 'utf8');
    const mem = Object.fromEntries(
      meminfo
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const [k, rest] = l.split(':');
          const v = Number((rest ?? '').trim().split(/\s+/)[0] ?? '0');
          return [k, v];
        })
    ) as Record<string, number>;

    const totalBytes = (mem.MemTotal ?? 0) * 1024;
    const freeBytes = (mem.MemAvailable ?? mem.MemFree ?? 0) * 1024;
    const usedBytes = Math.max(0, totalBytes - freeBytes);

    // Disk via statfs
    const statfs = await fs.statfs(this.diskMount);
    const diskTotalBytes = statfs.bsize * statfs.blocks;
    const diskFreeBytes = statfs.bsize * statfs.bavail;
    const diskUsedBytes = Math.max(0, diskTotalBytes - diskFreeBytes);
    const diskUsedPct = diskTotalBytes > 0 ? (diskUsedBytes / diskTotalBytes) * 100 : 0;

    // Network from /proc/net/dev (aggregate)
    const netDev = await fs.readFile('/proc/net/dev', 'utf8');
    const lines = netDev.split('\n').slice(2).map((l) => l.trim()).filter(Boolean);

    let rx = 0;
    let tx = 0;
    for (const l of lines) {
      const [iface, rest] = l.split(':');
      if (!rest) continue;
      const name = iface.trim();
      if (name === 'lo') continue;
      const cols = rest.trim().split(/\s+/).map((x) => Number(x));
      rx += Number.isFinite(cols[0]) ? cols[0] : 0;
      tx += Number.isFinite(cols[8]) ? cols[8] : 0;
    }

    const now = Date.now();
    const prevNet = this.real.lastNet;
    this.real.lastNet = { ts: now, rx, tx };

    let rxBytesPerSec = 0;
    let txBytesPerSec = 0;
    if (prevNet) {
      const dt = (now - prevNet.ts) / 1000;
      if (dt > 0) {
        rxBytesPerSec = Math.max(0, (rx - prevNet.rx) / dt);
        txBytesPerSec = Math.max(0, (tx - prevNet.tx) / dt);
      }
    }

    return {
      ts: new Date().toISOString(),
      cpu: {
        usagePct: Number(usagePct.toFixed(1)),
        avg1mPct: Number(avg1mPct.toFixed(1)),
        perCorePct: perCorePct.map((x) => Number(x.toFixed(1)))
      },
      memory: { totalBytes, usedBytes, freeBytes },
      disk: {
        mount: this.diskMount,
        totalBytes: diskTotalBytes,
        usedBytes: diskUsedBytes,
        usedPct: Number(diskUsedPct.toFixed(1))
      },
      network: {
        rxBytesPerSec: Math.round(rxBytesPerSec),
        txBytesPerSec: Math.round(txBytesPerSec)
      }
    };
  }
}
