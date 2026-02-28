import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	server: {
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.string().url(),
		AUTH_COOKIE_DOMAIN: z.string().min(1),
		AUTH_TRUSTED_ORIGINS: z.string().min(1),
		BATTLENET_US_CLIENT_ID: z.string().min(1).optional(),
		BATTLENET_US_CLIENT_SECRET: z.string().min(1).optional(),
		BATTLENET_EU_CLIENT_ID: z.string().min(1).optional(),
		BATTLENET_EU_CLIENT_SECRET: z.string().min(1).optional(),
		BATTLENET_KR_CLIENT_ID: z.string().min(1).optional(),
		BATTLENET_KR_CLIENT_SECRET: z.string().min(1).optional(),
		BATTLENET_TW_CLIENT_ID: z.string().min(1).optional(),
		BATTLENET_TW_CLIENT_SECRET: z.string().min(1).optional(),
		REDIS_URL: z.string().optional(),
		NODE_ENV: z
			.enum(['development', 'test', 'production'])
			.default('development'),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
})
