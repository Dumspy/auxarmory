import { serve } from '@hono/node-server';

import { createApiApp } from './app';
import { env } from './env';

const app = createApiApp();

serve(
	{
		fetch: app.fetch,
		port: env.API_SERVICE_PORT,
	},
	(info) => {
		console.log(
			`API service listening on ${env.API_SERVICE_ORIGIN} (port ${info.port})`,
		);
	},
);
