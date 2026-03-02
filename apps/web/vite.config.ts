import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { sentryTanstackStart } from '@sentry/tanstackstart-react/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const plugins = [
	devtools(),
	nitro({ rollupConfig: { external: [/^@sentry\//] } }),
	tsconfigPaths({ projects: ['./tsconfig.json'] }),
	tailwindcss(),
	tanstackStart(),
	viteReact({
		babel: {
			plugins: ['babel-plugin-react-compiler'],
		},
	}),
]

if (process.env.SENTRY_AUTH_TOKEN) {
	plugins.push(
		sentryTanstackStart({
			org: process.env.SENTRY_ORG,
			project: process.env.SENTRY_PROJECT,
			authToken: process.env.SENTRY_AUTH_TOKEN,
		}),
	)
}

const config = defineConfig({
	plugins,
})

export default config
