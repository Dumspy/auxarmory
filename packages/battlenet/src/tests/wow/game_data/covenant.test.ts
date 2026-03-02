import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data covenant', () => {
	const client = createApplicationClient()
	let covenantId: number
	let soulbindId: number
	let conduitId: number
	let covenantIndexFailures: unknown[]
	let soulbindIndexFailures: unknown[]
	let conduitIndexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-covenant-index',
			inputs: [null],
			call: async () => client.wow.CovenantIndex(),
			saveId: () => 'root',
		})
		covenantIndexFailures = failures

		const firstCovenant = indexResults[0]?.output?.covenants?.[0] ?? null
		if (!firstCovenant?.id) {
			throw new Error('CovenantIndex did not return any ids')
		}
		covenantId = firstCovenant.id

		const { results: soulbindIndexResults, failures: soulbindFailures } =
			await runEndpoint({
				name: 'wow-game-data-covenant-soulbind-index',
				inputs: [null],
				call: async () => client.wow.CovenantSoulbindIndex(),
				saveId: () => 'root',
			})
		soulbindIndexFailures = soulbindFailures

		const firstSoulbind =
			soulbindIndexResults[0]?.output?.soulbinds?.[0] ?? null
		if (!firstSoulbind?.id) {
			throw new Error('CovenantSoulbindIndex did not return any ids')
		}
		soulbindId = firstSoulbind.id

		const { results: conduitIndexResults, failures: conduitFailures } =
			await runEndpoint({
				name: 'wow-game-data-covenant-conduit-index',
				inputs: [null],
				call: async () => client.wow.CovenantConduitIndex(),
				saveId: () => 'root',
			})
		conduitIndexFailures = conduitFailures

		const firstConduit =
			conduitIndexResults[0]?.output?.conduits?.[0] ?? null
		if (!firstConduit?.id) {
			throw new Error('CovenantConduitIndex did not return any ids')
		}
		conduitId = firstConduit.id
	})

	it('validates covenant index endpoint', () => {
		expect(covenantIndexFailures).toHaveLength(0)
	})

	it('validates covenant endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-covenant',
			inputs: [covenantId],
			call: async (id) => client.wow.Covenant(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates covenant media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-covenant-media',
			inputs: [covenantId],
			call: async (id) => client.wow.CovenantMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates covenant soulbind index endpoint', () => {
		expect(soulbindIndexFailures).toHaveLength(0)
	})

	it('validates covenant soulbind endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-covenant-soulbind',
			inputs: [soulbindId],
			call: async (id) => client.wow.CovenantSoulbind(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates covenant conduit index endpoint', () => {
		expect(conduitIndexFailures).toHaveLength(0)
	})

	it('validates covenant conduit endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-covenant-conduit',
			inputs: [conduitId],
			call: async (id) => client.wow.CovenantConduit(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
