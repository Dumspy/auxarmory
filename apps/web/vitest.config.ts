import { defineConfig, mergeConfig } from 'vitest/config'
import shared from '@auxarmory/vitest-config/shared'

export default mergeConfig(
	shared,
	defineConfig({
		test: {
			environment: 'jsdom',
			setupFiles: ['./test/setup.ts'],
			include: [
				'src/**/*.{test,spec}.{ts,tsx}',
				'test/**/*.{test,spec}.{ts,tsx}',
			],
		},
	}),
)
