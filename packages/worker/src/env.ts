import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	server: {
		BATTLENET_CLIENT_ID: z.string().min(1),
		BATTLENET_CLIENT_SECRET: z.string().min(1),
		REDIS_URL: z.string(),
		NODE_ENV: z
			.enum(['development', 'test', 'production'])
			.default('development'),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
})
