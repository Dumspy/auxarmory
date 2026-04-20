# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base

ARG PNPM_VERSION=10.11.0

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack install --global pnpm@${PNPM_VERSION}

FROM base AS deps

WORKDIR /app

COPY json/ .

RUN --mount=type=cache,id=pnpm-store-db-migrations,target=/pnpm/store \
	HUSKY=0 pnpm install --frozen-lockfile --store-dir /pnpm/store

FROM node:22-bookworm-slim AS runner

WORKDIR /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node full/ .

USER node

CMD ["node", "node_modules/drizzle-kit/bin.cjs", "migrate", "--config", "packages/db/drizzle.config.ts"]
