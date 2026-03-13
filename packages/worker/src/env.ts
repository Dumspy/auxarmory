import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	server: {
		BATTLENET_CLIENT_ID: z.string().min(1),
		BATTLENET_CLIENT_SECRET: z.string().min(1),
		REDIS_URL: z.string(),
		API_SERVICE_ORIGIN: z.string().url().default('http://localhost:4001'),
		INTERNAL_API_TOKEN: z.string().min(1).optional(),
		FAILURE_SINK_TIMEOUT_MS: z.coerce.number().int().min(50).default(400),
		NODE_ENV: z
			.enum(['development', 'test', 'production'])
			.default('development'),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
})
