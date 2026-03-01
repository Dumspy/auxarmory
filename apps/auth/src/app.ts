import * as Sentry from '@sentry/node'
import { createServiceErrorCaptureContext } from '@auxarmory/observability'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'

import { auth } from '@auxarmory/auth'

import { env } from './env.js'

export function createAuthApp() {
	const app = new Hono()

	app.use(logger())
	app.use(
		'/*',
		cors({
			origin: env.WEB_ORIGIN,
			allowMethods: ['GET', 'POST', 'OPTIONS'],
			allowHeaders: ['Content-Type', 'Authorization'],
			credentials: true,
		}),
	)

	app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))

	app.get('/health', (c) => {
		return c.json({ status: 'ok', service: 'auth' })
	})

	app.onError((error, c) => {
		const status = error instanceof HTTPException ? error.status : 500

		if (status >= 500) {
			Sentry.captureException(
				error,
				createServiceErrorCaptureContext({
					service: 'auth',
					method: c.req.method,
					route: c.req.path,
					status,
				}),
			)
		}

		if (error instanceof HTTPException) {
			return error.getResponse()
		}

		return c.text('Internal Server Error', 500)
	})

	return app
}
