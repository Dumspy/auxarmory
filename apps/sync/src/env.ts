import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	server: {
		REDIS_URL: z.string(),
		BATTLENET_US_CLIENT_ID: z.string().min(1).optional(),
		BATTLENET_US_CLIENT_SECRET: z.string().min(1).optional(),
		BATTLENET_EU_CLIENT_ID: z.string().min(1).optional(),
		BATTLENET_EU_CLIENT_SECRET: z.string().min(1).optional(),
		BATTLENET_KR_CLIENT_ID: z.string().min(1).optional(),
		BATTLENET_KR_CLIENT_SECRET: z.string().min(1).optional(),
		BATTLENET_TW_CLIENT_ID: z.string().min(1).optional(),
		BATTLENET_TW_CLIENT_SECRET: z.string().min(1).optional(),
		SYNC_SCAN_LINKED_ACCOUNTS_EVERY_MS: z.coerce
			.number()
			.int()
			.positive()
			.default(10 * 60 * 1000),
		SYNC_SCAN_GUILDS_EVERY_MS: z.coerce
			.number()
			.int()
			.positive()
			.default(5 * 60 * 1000),
		SYNC_RECONCILE_GUILD_CONTROL_EVERY_MS: z.coerce
			.number()
			.int()
			.positive()
			.default(5 * 60 * 1000),
		NODE_ENV: z
			.enum(['development', 'test', 'production'])
			.default('development'),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
})
