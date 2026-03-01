import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	server: {
		REDIS_URL: z.string(),
		NODE_ENV: z
			.enum(['development', 'test', 'production'])
			.default('development'),
		SENTRY_DSN: z.string().optional(),
		SENTRY_ENV: z.string().default('development'),
		SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
		SENTRY_RELEASE: z.string().optional(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
})
