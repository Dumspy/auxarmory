import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { auth } from '@auxarmory/auth';

import { env } from './env';

const app = new Hono();

app.use(logger());
app.use(
	'/*',
	cors({
		origin: env.WEB_ORIGIN,
		allowMethods: ['GET', 'POST', 'OPTIONS'],
		allowHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	})
);

app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw));

app.get('/health', (c) => {
	return c.json({ status: 'ok', service: 'auth' });
});

serve(
	{
		fetch: app.fetch,
		port: env.AUTH_SERVICE_PORT,
	},
	(info) => {
		console.log(`Auth service listening on ${env.AUTH_SERVICE_ORIGIN} (port ${info.port})`);
	}
);
