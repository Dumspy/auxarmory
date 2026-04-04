import { serve } from '@hono/node-server'
import * as Sentry from '@sentry/node'
import { createServiceErrorCaptureContext } from '@auxarmory/observability'
import { checkApiReadiness } from '@auxarmory/api/health'

import { createApiApp } from './app'
import { env } from './env'

async function runStartupReadinessCheck() {
	const readiness = await checkApiReadiness()

	if (!readiness.ready) {
		throw new Error(
			`API readiness failed: ${JSON.stringify(readiness.checks)}`,
		)
	}
}

const app = createApiApp()

try {
	await runStartupReadinessCheck()
} catch (error) {
	Sentry.captureException(
		error,
		createServiceErrorCaptureContext({
			service: 'api',
			method: 'STARTUP',
			route: '/ready',
			status: 503,
		}),
	)

	console.error(
		'[api] startup readiness check failed. Service will not start.',
		error,
	)
	process.exit(1)
}

serve(
	{
		fetch: app.fetch,
		port: env.API_SERVICE_PORT,
	},
	(info) => {
		console.log(
			`API service listening on ${env.API_SERVICE_ORIGIN} (port ${info.port})`,
		)
	},
)
