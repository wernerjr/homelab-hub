# homelab-hub

Dashboard web único (single-page) para seu homelab: atalhos + métricas em “quase tempo real”.

- **Backend**: Node.js + TypeScript + Fastify (vertical slice)
- **Frontend**: React + TypeScript + Tailwind CSS v4
- **Dark mode** por padrão

## Estrutura

- `backend/src/app.ts` – bootstrap do Fastify
- `backend/src/features/apps` – rota + schemas + service (apps)
- `backend/src/features/metrics` – rota + schemas + service (métricas)
- `backend/src/core` – config/util

- `frontend/src/main.tsx` – bootstrap
- `frontend/src/modules/apps` – hooks + componentes de apps
- `frontend/src/modules/metrics` – hooks + componentes de métricas
- `frontend/src/components/ui` – componentes compartilhados

## Requisitos

- Node.js 22+
- npm

## Instalação (dev)

Na raiz do projeto:

```bash
npm install
```

### Rodar backend (dev)

```bash
npm run dev:backend
```

Backend sobe por padrão em `http://localhost:8080`.

### Rodar frontend (dev)

Em outro terminal:

```bash
npm run dev:frontend
```

Frontend (Vite) sobe em `http://localhost:5173` e faz proxy de `/api` para o backend.

## Build

```bash
npm run build:backend
npm run build:frontend
```

## Testes

```bash
npm test
```

- Backend: 1 teste de rota Fastify (Tap)
- Frontend: 1 teste de componente (Vitest + Testing Library)

## Docker (produção / single URL)

O container serve o frontend estático pelo backend Fastify — você acessa **uma única URL**.

### Subir

```bash
docker compose up -d --build
```

Por padrão, mapeia `80:8080`.

Acesse:

- `http://<IP_DO_SERVIDOR>/`

## Onde editar a lista de apps

Opções:

1) **Arquivo JSON (recomendado no Docker)**
- `data/apps.json`
- controlado por `APPS_FILE=/app/data/apps.json` (já no `docker-compose.yml`)

2) Defaults em código
- `backend/src/features/apps/service.ts` (`defaultApps`)

O backend valida o JSON com Zod e faz fallback para os defaults se o arquivo estiver ausente/inválido.

## Onde plugar métricas reais

- `backend/src/features/metrics/service.ts`

Hoje o serviço suporta **mock** e um modo **real (Linux)** lendo:
- CPU: `/proc/stat` (delta entre snapshots; total + por core)
- Load 1m: `/proc/loadavg`
- Memória: `/proc/meminfo` (MemTotal/MemAvailable)
- Rede: `/proc/net/dev` (delta agregado; ignora `lo`)
- Disco: `statfs()` no mount configurado

### Variáveis de ambiente (métricas)

- `METRICS_MODE=auto|real|mock` (default: `auto`)
- `DISK_MOUNT=/` (default: `/`)

### Variáveis de ambiente (apps)

- `APPS_FILE=/caminho/para/apps.json` (opcional)

Substituição típica futura:
- consultar Prometheus / node_exporter
- usar libs como `systeminformation`
