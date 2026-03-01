import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data wow token', () => {
	const client = createApplicationClient()
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-wow-token-index',
			inputs: [null],
			call: async () => client.wow.WoWTokenIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures
	})

	it('validates wow token index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})
})
