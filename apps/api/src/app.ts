import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import * as Sentry from '@sentry/node'
import { createServiceErrorCaptureContext } from '@auxarmory/observability'
import {
	internalFailureSinkSchema,
	persistInternalFailureSinkEvent,
} from '@auxarmory/api/internal/failure_sink'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'

import { createContext } from '@auxarmory/api/context'
import { appRouter } from '@auxarmory/api/routers'

import { env } from './env'

export function createApiApp() {
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

	app.all('/trpc/*', async (c) => {
		const context = await createContext({ headers: c.req.raw.headers })

		if (context.session?.user) {
			Sentry.setUser({
				id: context.session.user.id,
				email: context.session.user.email,
			})
		} else {
			Sentry.setUser(null)
		}

		return fetchRequestHandler({
			endpoint: '/trpc',
			req: c.req.raw,
			router: appRouter,
			createContext: () => context,
		})
	})

	app.get('/health', (c) => {
		return c.json({ status: 'ok', service: 'api' })
	})

	app.post('/internal/failure-sink/battlenet', async (c) => {
		if (!env.INTERNAL_API_TOKEN) {
			return c.json({ message: 'Internal sink is not configured' }, 503)
		}

		const internalToken = c.req.header('x-internal-token')
		if (internalToken !== env.INTERNAL_API_TOKEN) {
			return c.json({ message: 'Unauthorized' }, 401)
		}

		const body = await c.req.json().catch(() => null)
		const parsed = internalFailureSinkSchema.safeParse(body)
		if (!parsed.success) {
			return c.json({ message: 'Invalid payload' }, 400)
		}

		const result = await persistInternalFailureSinkEvent(parsed.data)

		return c.json(result, 201)
	})

	app.onError((error, c) => {
		const status = error instanceof HTTPException ? error.status : 500

		Sentry.captureException(
			error,
			createServiceErrorCaptureContext({
				service: 'api',
				method: c.req.method,
				route: c.req.path,
				status,
			}),
		)

		if (error instanceof HTTPException) {
			return error.getResponse()
		}

		return c.text('Internal Server Error', 500)
	})

	return app
}
