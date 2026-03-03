import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../../harness.clients'
import { runEndpoint } from '../../../harness'

describe('battlenet wow game data media', () => {
	const client = createApplicationClient()
	let searchFailures: unknown[]

	beforeAll(async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-media-search',
			inputs: [null],
			call: async () => client.wow.MediaSearch(new URLSearchParams()),
			saveId: () => 'root',
		})
		searchFailures = failures
	})

	it('validates media search endpoint', () => {
		expect(searchFailures).toHaveLength(0)
	})
})
