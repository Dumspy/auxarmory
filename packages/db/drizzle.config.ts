import { defineConfig } from 'drizzle-kit'

import { env } from './src/env'

export default defineConfig({
	schema: './packages/db/drizzle.schema.ts',
	out: './packages/db/drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: env.DATABASE_URL,
	},
})
