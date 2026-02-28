import { defineConfig, mergeConfig } from 'vitest/config'

import shared from '@auxarmory/vitest-config/shared'

export default mergeConfig(
	shared,
	defineConfig({
		test: {
			include: ['src/**/*.test.ts'],
			sequence: {
				concurrent: false,
			},
		},
	}),
)
