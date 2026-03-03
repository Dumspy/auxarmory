import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { extractNumericId, runEndpoint } from '../../harness'

describe('battlenet wow game data region', () => {
	const client = createApplicationClient()
	let regionId: number
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-region-index',
			inputs: [null],
			call: async () => client.wow.RegionIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const firstRegionHref = indexResults[0]?.output?.regions?.[0]?.href
		const extractedRegionId = extractNumericId(firstRegionHref)
		if (!extractedRegionId) {
			throw new Error('RegionIndex did not return any ids')
		}
		regionId = extractedRegionId
	})

	it('validates region index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates region endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-region',
			inputs: [regionId],
			call: async (id) => client.wow.Region(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
