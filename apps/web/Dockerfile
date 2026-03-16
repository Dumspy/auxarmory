# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

FROM base AS prod-deps

WORKDIR /app

COPY json/ .

RUN --mount=type=cache,id=pnpm-store-web-prod,target=/pnpm/store \
	HUSKY=0 pnpm install --prod --frozen-lockfile --ignore-scripts --store-dir /pnpm/store

FROM base AS builder

WORKDIR /app

COPY json/ .

RUN --mount=type=cache,id=pnpm-store-web-build,target=/pnpm/store \
	HUSKY=0 pnpm install --frozen-lockfile --store-dir /pnpm/store

COPY full/ .

RUN touch .env .env.example .env.local

ARG RELEASE_VERSION=development

ENV SENTRY_RELEASE=$RELEASE_VERSION
ENV VITE_SENTRY_RELEASE=$RELEASE_VERSION

RUN pnpm turbo run build --filter=@auxarmory/web

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ARG RELEASE_VERSION=development

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NITRO_HOST=0.0.0.0
ENV SENTRY_RELEASE=$RELEASE_VERSION
ENV VITE_SENTRY_RELEASE=$RELEASE_VERSION

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder --chown=node:node /app/apps ./apps
COPY --from=builder --chown=node:node /app/packages ./packages
COPY --from=builder --chown=node:node /app/tooling ./tooling

USER node

EXPOSE 3000

CMD ["node", "--import", "apps/web/.output/server/instrument.server.mjs", "apps/web/.output/server/index.mjs"]
