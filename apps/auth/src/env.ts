import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	server: {
		AUTH_SERVICE_PORT: z.coerce.number().int().positive().default(4000),
		AUTH_SERVICE_ORIGIN: z.string().url().default('http://localhost:4000'),
		WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
		NODE_ENV: z
			.enum(['development', 'test', 'production'])
			.default('development'),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
