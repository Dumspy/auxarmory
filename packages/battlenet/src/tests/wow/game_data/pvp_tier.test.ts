import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data pvp tier', () => {
	const client = createApplicationClient()
	let tierId: number
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-pvp-tier-index',
			inputs: [null],
			call: async () => client.wow.PvPTierIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const indexResult = indexResults[0]?.output
		if (!indexResult || typeof indexResult !== 'object') {
			throw new Error('PvPTierIndex did not return any ids')
		}
		const tiers = 'tiers' in indexResult ? indexResult.tiers : null
		if (!Array.isArray(tiers)) {
			throw new Error('PvPTierIndex did not return any ids')
		}
		const firstTier = tiers[0]
		if (
			!firstTier ||
			typeof firstTier !== 'object' ||
			!('id' in firstTier)
		) {
			throw new Error('PvPTierIndex did not return any ids')
		}
		const firstTierId = firstTier.id
		if (typeof firstTierId !== 'number' || !firstTierId) {
			throw new Error('PvPTierIndex did not return any ids')
		}
		tierId = firstTierId
	})

	it('validates pvp tier index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates pvp tier endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-pvp-tier',
			inputs: [tierId],
			call: async (id) => client.wow.PvPTier(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates pvp tier media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-pvp-tier-media',
			inputs: [tierId],
			call: async (id) => client.wow.PvPTierMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
