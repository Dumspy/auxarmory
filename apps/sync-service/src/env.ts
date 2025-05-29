import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		REDIS_URL: z.string().default("redis://localhost:6379"),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		DATABASE_URL: z.string().optional(),
		BATTLENET_CLIENT_ID: z.string().optional(),
		BATTLENET_CLIENT_SECRET: z.string().optional(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
