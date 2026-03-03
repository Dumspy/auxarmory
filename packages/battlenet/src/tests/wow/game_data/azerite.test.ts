import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data azerite', () => {
	const client = createApplicationClient()
	let essenceId: number
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-azerite-index',
			inputs: [null],
			call: async () => client.wow.AzeriteIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const firstEssence =
			indexResults[0]?.output?.azerite_essences?.[0] ?? null
		if (!firstEssence?.id) {
			throw new Error('AzeriteIndex did not return any ids')
		}
		essenceId = firstEssence.id
	})

	it('validates azerite index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates azerite endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-azerite',
			inputs: [String(essenceId)],
			call: async (id) => client.wow.Azerite(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates azerite media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-azerite-media',
			inputs: [essenceId],
			call: async (id) => client.wow.AzeriteMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
