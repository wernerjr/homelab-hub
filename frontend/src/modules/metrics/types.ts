export type Metrics = {
  ts: string;
  cpu: {
    usagePct: number;
    avg1mPct: number;
    perCorePct: number[];
  };
  memory: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
  };
  disk: {
    mount: string;
    totalBytes: number;
    usedBytes: number;
    usedPct: number;
  };
  network: {
    rxBytesPerSec: number;
    txBytesPerSec: number;
  };
};
