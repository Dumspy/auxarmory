# Sentry Setup

This document describes the Sentry error monitoring setup across the AuxArmory monorepo.

## Overview

Sentry is configured for the following applications:

- **Web App** (`apps/web`): Frontend with TanStack Start SDK
- **API Service** (`apps/api`): Backend API with Node.js SDK
- **Auth Service** (`apps/auth`): Authentication service with Node.js SDK
- **Sync Service** (`apps/worker-service`): Background worker with Node.js SDK

Each service has its own Sentry project for clean separation and alerting.

## Environment Variables

### Required for Sentry to work (production)

Each service requires the following environment variables:

**Web App** (`apps/web`):

- `VITE_SENTRY_DSN`: Sentry DSN for the web project
- `VITE_SENTRY_ENV`: Environment name (`production`, `staging`, `development`)
- `VITE_SENTRY_TRACES_SAMPLE_RATE`: Tracing sample rate (0.0 to 1.0)
- `VITE_SENTRY_RELEASE` (optional): Release version for better error grouping

**API Service** (`apps/api`):

- `SENTRY_DSN`: Sentry DSN for the API project
- `SENTRY_ENV`: Environment name
- `SENTRY_TRACES_SAMPLE_RATE`: Tracing sample rate
- `SENTRY_RELEASE` (optional): Release version

**Auth Service** (`apps/auth`):

- `SENTRY_DSN`: Sentry DSN for the auth project
- `SENTRY_ENV`: Environment name
- `SENTRY_TRACES_SAMPLE_RATE`: Tracing sample rate
- `SENTRY_RELEASE` (optional): Release version

**Sync Service** (`apps/worker-service`):

- `SENTRY_DSN`: Sentry DSN for the sync project
- `SENTRY_ENV`: Environment name
- `SENTRY_TRACES_SAMPLE_RATE`: Tracing sample rate
- `SENTRY_RELEASE` (optional): Release version

### Build-time Variables (for source maps)

When building the web app with source maps upload enabled:

- `SENTRY_AUTH_TOKEN`: Sentry authentication token for uploading source maps
- `SENTRY_ORG`: Sentry organization slug
- `SENTRY_PROJECT`: Sentry project slug for the web app

**Note**: These build-time variables are only required in CI/CD environments. Local builds will skip source map upload if these are not set.

## Architecture

### Web App (TanStack Start)

- **Client-side**: Initialized in `apps/web/src/router.tsx`
- **Server-side**: Initialized in `apps/web/instrument.server.mjs`
- **Error Boundary**: Root route error component in `apps/web/src/routes/__root.tsx`
- **Tracing**: TanStack Router tracing integration enabled
- **Session Replay**: Enabled for 10% of sessions and 100% of error sessions

### API/Auth Services

- **Initialization**: Preloaded via `--import` flag in `instrument.mjs`
- **Error Capture**: Automatic for unhandled exceptions
- **Tracing**: Enabled based on sample rate
- **Shared config**: Loaded from `@auxarmory/observability/node-instrument`
- **Route-level manual capture**: API and Auth `app.onError(...)` handlers use `createServiceErrorCaptureContext(...)`

### Sync Service

- **Initialization**: Preloaded via `--import` flag in `instrument.mjs`
- **Error Capture**: Automatic for unhandled exceptions
- **Worker Errors**: Explicit capture for failed BullMQ jobs with job context
- **Job Context**: Redacted payload metadata (keys, attempts, job ID)

### Shared Observability Package

- **Package**: `packages/observability`
- **Shared helpers**: Sentry base options, trace sample-rate normalization, payload redaction, and runtime tags
- **Node preload helper**: `@auxarmory/observability/node-instrument` used by `apps/api`, `apps/auth`, `apps/worker-service`, and `apps/web` server instrumentation

## Standard Tags

All events include the following tags for filtering and querying:

- `service`: Service name (`web`, `api`, `auth`, `sync`)
- `environment`: Environment (`development`, `staging`, `production`)
- `runtime`: Runtime environment (`browser`, `node`)
- `release`: Release version (if provided)

Sync service worker errors additionally include:

- `job_name`: Name of the failed job
- `job_id`: ID of the failed job

## Verification

### Web App

1. Start the dev server: `pnpm --filter @auxarmory/web dev`
2. Navigate to any page
3. Add a test route with an intentional error:

    ```tsx
    // apps/web/src/routes/sentry-test.tsx
    import { createFileRoute } from '@tanstack/react-router'
    import * as Sentry from '@sentry/tanstackstart-react'

    export const Route = createFileRoute('/sentry-test')({
    	component: SentryTest,
    })

    function SentryTest() {
    	return (
    		<button
    			type='button'
    			onClick={() => {
    				throw new Error('Sentry Test Error')
    			}}
    		>
    			Trigger Error
    		</button>
    	)
    }
    ```

4. Click the button to trigger an error
5. Verify the error appears in your Sentry web project

### API Service

1. Start the API service: `pnpm --filter @auxarmory/api-service dev`
2. Add a test route in `apps/api/src/app.ts`:

    ```ts
    app.get('/debug-sentry', () => {
    	throw new Error('Sentry API Test Error')
    })
    ```

3. Visit `http://localhost:4001/debug-sentry`
4. Verify the error appears in your Sentry API project

### Auth Service

1. Start the Auth service: `pnpm --filter @auxarmory/auth-service dev`
2. Add a test route in `apps/auth/src/app.ts`:

    ```ts
    app.get('/debug-sentry', () => {
    	throw new Error('Sentry Auth Test Error')
    })
    ```

3. Visit `http://localhost:4000/debug-sentry`
4. Verify the error appears in your Sentry auth project

### Sync Service

1. Start Redis: `docker compose up -d redis`
2. Start the sync worker: `pnpm --filter @auxarmory/worker-service dev`
3. Create a test job that throws an error in `apps/worker-service/src/jobs/`:

    ```ts
    export const syncExample = defineJob({
    	name: SYNC_EXAMPLE_NAME,
    	handler: async () => {
    		throw new Error('Sentry Job Test Error')
    	},
    })
    ```

4. Queue the job
5. Verify the error appears in your Sentry sync project with job context

## Agent Access (Dev Environment)

Agents access Sentry events via **Sentry MCP** (Model Context Protocol). No local pull script is maintained.

Recommended MCP query patterns for agents:

- **Filter by service**: `service:web AND environment:development`
- **Filter by timeframe**: `timestamp:>2026-03-01T00:00:00Z`
- **Filter by release**: `release:1.0.0`
- **Job failures**: `service:sync AND level:error`

## Troubleshooting

### Build errors: "Missing SENTRY_AUTH_TOKEN"

If you see errors about missing `SENTRY_AUTH_TOKEN` during build:

- **Local builds**: This is expected. Source map upload will be skipped.
- **CI builds**: Ensure `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` are set in your CI environment.

### Events not appearing in Sentry

1. Check that `SENTRY_DSN` (or `VITE_SENTRY_DSN` for web) is set correctly
2. Verify the environment name is set
3. Check browser console for network errors (blocked by ad blockers, etc.)
4. Verify you're using the correct Sentry project for each service

### TypeScript errors after adding Sentry

Run `pnpm build` in the affected workspace to ensure types are resolved correctly.

## Privacy

By default, Sentry captures PII headers and IP addresses (`sendDefaultPii: true`) for better user tracking. Adjust this in each service's `instrument.mjs` or `router.tsx` as needed.

All custom contexts and extra data (e.g., job payloads in sync service) are redacted before being sent to Sentry to avoid leaking sensitive information.
