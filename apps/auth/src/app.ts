import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { auth } from '@auxarmory/auth';

import { env } from './env.js';

export function createAuthApp() {
	const app = new Hono();

	app.use(logger());
	app.use(
		'/*',
		cors({
			origin: env.WEB_ORIGIN,
			allowMethods: ['GET', 'POST', 'OPTIONS'],
			allowHeaders: ['Content-Type', 'Authorization'],
			credentials: true,
		}),
	);

	app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw));

	app.get('/health', (c) => {
		return c.json({ status: 'ok', service: 'auth' });
	});

	return app;
}
