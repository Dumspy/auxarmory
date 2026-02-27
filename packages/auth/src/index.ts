import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from '@auxarmory/db/client';
import * as schema from '@auxarmory/db/schema';

import { env } from './env';

const trustedOrigins = env.AUTH_TRUSTED_ORIGINS.split(',').map((origin) =>
	origin.trim(),
);

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema,
	}),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins,
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		crossSubDomainCookies: {
			enabled: true,
			domain: env.AUTH_COOKIE_DOMAIN,
		},
		defaultCookieAttributes: {
			httpOnly: true,
			secure: env.NODE_ENV === 'production',
			sameSite: 'lax',
		},
	},
});
