import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data heirloom', () => {
	const client = createApplicationClient()
	let heirloomId: number
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-heirloom-index',
			inputs: [null],
			call: async () => client.wow.HeirloomIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const firstHeirloom = indexResults[0]?.output?.heirlooms?.[0] ?? null
		if (!firstHeirloom?.id) {
			throw new Error('HeirloomIndex did not return any ids')
		}
		heirloomId = firstHeirloom.id
	})

	it('validates heirloom index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates heirloom endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-heirloom',
			inputs: [heirloomId],
			call: async (id) => client.wow.Heirloom(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
