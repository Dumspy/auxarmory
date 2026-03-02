import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'

import { createContext } from '@auxarmory/api/context'
import { appRouter } from '@auxarmory/api/routers'

import { env } from './env.js'

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

	app.all('/trpc/*', (c) => {
		return fetchRequestHandler({
			endpoint: '/trpc',
			req: c.req.raw,
			router: appRouter,
			createContext: () => createContext({ headers: c.req.raw.headers }),
		})
	})

	app.get('/health', (c) => {
		return c.json({ status: 'ok', service: 'api' })
	})

	app.onError((error, c) => {
		if (error instanceof HTTPException) {
			return error.getResponse()
		}

		return c.text('Internal Server Error', 500)
	})

	return app
}
