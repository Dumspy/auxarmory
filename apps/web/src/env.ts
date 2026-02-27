import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	clientPrefix: 'VITE_',
	client: {
		VITE_APP_NAME: z.string().default('AuxArmory'),
		VITE_APP_URL: z.string().url().default('http://localhost:3000'),
	},
	runtimeEnv: import.meta.env,
	emptyStringAsUndefined: true,
});
