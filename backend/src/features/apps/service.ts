import type { z } from 'zod';
import { AppSchema } from './schemas.js';

export type App = z.infer<typeof AppSchema>;

// Default in-memory storage (easy to swap for DB later)
export const defaultApps: App[] = [
  {
    id: 'grafana',
    name: 'Grafana',
    category: 'Observability',
    url: 'http://grafana.local',
    status: 'online',
    description: 'Dashboards e alertas.'
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    category: 'Observability',
    url: 'http://prometheus.local',
    status: 'online',
    description: 'Métricas e time-series.'
  },
  {
    id: 'portainer',
    name: 'Portainer',
    category: 'Containers',
    url: 'http://portainer.local',
    status: 'unknown',
    description: 'UI para Docker e stacks.'
  },
  {
    id: 'proxmox',
    name: 'Proxmox',
    category: 'Compute',
    url: 'https://proxmox.local:8006',
    status: 'unknown',
    description: 'Virtualização e gestão de VMs.'
  }
];

export class AppsService {
  constructor(private deps: { list: () => Promise<App[]> }) {}

  async list(): Promise<App[]> {
    return this.deps.list();
  }
}
