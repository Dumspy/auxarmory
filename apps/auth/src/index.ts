import { serve } from '@hono/node-server'
import * as Sentry from '@sentry/node'
import { createServiceErrorCaptureContext } from '@auxarmory/observability'
import { checkAuthReadiness } from '@auxarmory/auth/health'

import { createAuthApp } from './app'
import { env } from './env'

async function runStartupReadinessCheck() {
	const readiness = await checkAuthReadiness()

	if (!readiness.ready) {
		throw new Error(
			`Auth readiness failed: ${JSON.stringify(readiness.checks)}`,
		)
	}
}

const app = createAuthApp()

try {
	await runStartupReadinessCheck()
} catch (error) {
	Sentry.captureException(
		error,
		createServiceErrorCaptureContext({
			service: 'auth',
			method: 'STARTUP',
			route: '/ready',
			status: 503,
		}),
	)

	console.error(
		'[auth] startup readiness check failed. Service will not start.',
		error,
	)
	process.exit(1)
}

serve(
	{
		fetch: app.fetch,
		port: env.AUTH_SERVICE_PORT,
	},
	(info) => {
		console.log(
			`Auth service listening on ${env.AUTH_SERVICE_ORIGIN} (port ${info.port})`,
		)
	},
)
