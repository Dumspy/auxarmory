import { defineConfig } from 'drizzle-kit'

import { env } from './packages/db/src/env'

export default defineConfig({
	schema: './packages/db/src/schema.ts',
	out: './packages/db/drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: env.DATABASE_URL,
	},
})
