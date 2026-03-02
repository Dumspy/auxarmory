import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data reputation', () => {
	const client = createApplicationClient()
	let factionId: number
	let tierId: number | null
	let factionIndexFailures: unknown[]
	let tiersIndexFailures: unknown[]

	beforeAll(async () => {
		const { results: factionIndexResults, failures } = await runEndpoint({
			name: 'wow-game-data-reputation-faction-index',
			inputs: [null],
			call: async () => client.wow.ReputationFactionIndex(),
			saveId: () => 'root',
		})
		factionIndexFailures = failures

		const factionIndexResult = factionIndexResults[0]?.output
		if (!factionIndexResult || typeof factionIndexResult !== 'object') {
			throw new Error('ReputationFactionIndex did not return any ids')
		}
		const factions =
			'factions' in factionIndexResult
				? factionIndexResult.factions
				: null
		if (!Array.isArray(factions)) {
			throw new Error('ReputationFactionIndex did not return any ids')
		}
		const firstFaction = factions[0]
		if (
			!firstFaction ||
			typeof firstFaction !== 'object' ||
			!('id' in firstFaction)
		) {
			throw new Error('ReputationFactionIndex did not return any ids')
		}
		const firstFactionId = firstFaction.id
		if (typeof firstFactionId !== 'number' || !firstFactionId) {
			throw new Error('ReputationFactionIndex did not return any ids')
		}
		factionId = firstFactionId

		const { results: tiersIndexResults, failures: tierFailures } =
			await runEndpoint({
				name: 'wow-game-data-reputation-tiers-index',
				inputs: [null],
				call: async () => client.wow.ReputationTiersIndex(),
				saveId: () => 'root',
			})
		tiersIndexFailures = tierFailures

		const tiersIndexResult = tiersIndexResults[0]?.output
		if (!tiersIndexResult || typeof tiersIndexResult !== 'object') {
			tierId = null
			return
		}
		const reputationTiers =
			'reputation_tiers' in tiersIndexResult
				? tiersIndexResult.reputation_tiers
				: null
		if (!Array.isArray(reputationTiers)) {
			tierId = null
			return
		}
		const firstTier = reputationTiers[0]
		if (
			!firstTier ||
			typeof firstTier !== 'object' ||
			!('id' in firstTier)
		) {
			tierId = null
			return
		}
		const firstTierId = firstTier.id
		tierId =
			typeof firstTierId === 'number' && firstTierId ? firstTierId : null
	})

	it('validates reputation faction index endpoint', () => {
		expect(factionIndexFailures).toHaveLength(0)
	})

	it('validates reputation faction endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-reputation-faction',
			inputs: [factionId],
			call: async (id) => client.wow.ReputationFaction(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates reputation tiers index endpoint', () => {
		expect(tiersIndexFailures).toHaveLength(0)
	})

	it('validates reputation tiers endpoint', async () => {
		if (!tierId) return
		const { failures } = await runEndpoint({
			name: 'wow-game-data-reputation-tiers',
			inputs: [tierId],
			call: async (id) => client.wow.ReputationTiers(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
