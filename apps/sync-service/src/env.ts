import { createEnv } from "@t3-oss/env-core";
import { RegionsConst } from "@auxarmory/battlenet/types";
import { z } from "zod";

export const env = createEnv({
	server: {
		REDIS_URL: z.string().default("redis://localhost:6379"),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		DATABASE_URL: z.string(),
		BATTLENET_CLIENT_ID: z.string(),
		BATTLENET_CLIENT_SECRET: z.string(),
		BATTLENET_REGION: z.enum(RegionsConst).default("eu"),

	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
