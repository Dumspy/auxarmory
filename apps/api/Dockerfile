# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base

ARG PNPM_VERSION=10.11.0

ENV PNPM_HOME=/pnpm
ENV COREPACK_HOME=/pnpm/corepack
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack install --global pnpm@${PNPM_VERSION}

FROM base AS prod-deps

WORKDIR /app

COPY json/ .

RUN --mount=type=cache,id=pnpm-store-api-prod,target=/pnpm/store \
	HUSKY=0 pnpm install --prod --frozen-lockfile --ignore-scripts --store-dir /pnpm/store

FROM base AS builder

WORKDIR /app

COPY json/ .

RUN --mount=type=cache,id=pnpm-store-api-build,target=/pnpm/store \
	HUSKY=0 pnpm install --frozen-lockfile --store-dir /pnpm/store

COPY full/ .

RUN touch .env .env.example .env.local

ARG RELEASE_VERSION=development

ENV SENTRY_RELEASE=$RELEASE_VERSION

RUN pnpm turbo run build --filter=@auxarmory/api-service

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ARG RELEASE_VERSION=development

ENV NODE_ENV=production
ENV API_SERVICE_PORT=4001
ENV SENTRY_RELEASE=$RELEASE_VERSION

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder --chown=node:node /app/apps ./apps
COPY --from=builder --chown=node:node /app/packages ./packages
COPY --from=builder --chown=node:node /app/tooling ./tooling

USER node

EXPOSE 4001

ENTRYPOINT ["sh", "packages/db/scripts/wait-for-migrations.sh"]
CMD ["npm", "--prefix", "apps/api", "run", "start"]
