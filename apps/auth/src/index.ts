import { serve } from '@hono/node-server'

import { createAuthApp } from './app.js'
import { env } from './env.js'

const app = createAuthApp()

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
