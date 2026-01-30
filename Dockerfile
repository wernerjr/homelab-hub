# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY backend ./backend
COPY frontend ./frontend

RUN npm -w backend run build
RUN npm -w frontend run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# journalctl for host logs (requires /var/log/journal mount + systemd-journal group)
RUN apt-get update \
  && apt-get install -y --no-install-recommends systemd \
  && rm -rf /var/lib/apt/lists/*

# Only install production deps for backend
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
RUN npm ci --omit=dev -w backend

COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/frontend/dist ./backend/public

USER node
EXPOSE 8080

ENV HOST=0.0.0.0
ENV PORT=8080
ENV STATIC_DIR=/app/backend/public
ENV CORS_ORIGIN=http://localhost

CMD ["node", "backend/dist/server.js"]
