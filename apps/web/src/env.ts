import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	clientPrefix: 'VITE_',
	client: {
		VITE_APP_NAME: z.string().default('AuxArmory'),
		VITE_APP_URL: z.string().url().default('http://localhost:3000'),
		VITE_AUTH_URL: z.string().url().default('http://localhost:4000'),
		VITE_API_URL: z.string().url().default('http://localhost:4001'),
		VITE_SENTRY_DSN: z.string().optional(),
		VITE_SENTRY_ENV: z.string().default('development'),
		VITE_SENTRY_TRACES_SAMPLE_RATE: z.coerce
			.number()
			.min(0)
			.max(1)
			.default(0.1),
		VITE_SENTRY_RELEASE: z.string().optional(),
	},
	runtimeEnv: import.meta.env,
	emptyStringAsUndefined: true,
})
