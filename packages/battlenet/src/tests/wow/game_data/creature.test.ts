import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data creature', () => {
	const client = createApplicationClient()
	let creatureTypeId: number
	let creatureFamilyId: number
	let creatureId: number
	let displayId: number
	let typeIndexFailures: unknown[]
	let familyIndexFailures: unknown[]
	let searchIndexFailures: unknown[]

	beforeAll(async () => {
		const { results: typeIndexResults, failures } = await runEndpoint({
			name: 'wow-game-data-creature-type-index',
			inputs: [null],
			call: async () => client.wow.CreatureTypeIndex(),
			saveId: () => 'root',
		})
		typeIndexFailures = failures

		const firstType =
			typeIndexResults[0]?.output?.creature_types?.[0] ?? null
		if (!firstType?.id) {
			throw new Error('CreatureTypeIndex did not return any ids')
		}
		creatureTypeId = firstType.id

		const { results: familyIndexResults, failures: familyFailures } =
			await runEndpoint({
				name: 'wow-game-data-creature-family-index',
				inputs: [null],
				call: async () => client.wow.CreatueFamilyIndex(),
				saveId: () => 'root',
			})
		familyIndexFailures = familyFailures

		const firstFamily =
			familyIndexResults[0]?.output?.creature_families?.[0] ?? null
		if (!firstFamily?.id) {
			throw new Error('CreatureFamilyIndex did not return any ids')
		}
		creatureFamilyId = firstFamily.id

		const { results: indexResults, failures: indexFailures } =
			await runEndpoint({
				name: 'wow-game-data-creature-search',
				inputs: [null],
				call: async () =>
					client.wow.CreatureSearch(new URLSearchParams()),
				saveId: () => 'root',
			})
		searchIndexFailures = indexFailures

		const searchResult = indexResults[0]?.output
		if (!searchResult || typeof searchResult !== 'object') {
			throw new Error('CreatureSearch did not return any results')
		}
		const results = 'results' in searchResult ? searchResult.results : null
		if (!Array.isArray(results)) {
			throw new Error('CreatureSearch did not return any ids')
		}
		const firstResult = results[0]
		if (!firstResult || typeof firstResult !== 'object') {
			throw new Error('CreatureSearch did not return any ids')
		}
		const data = 'data' in firstResult ? firstResult.data : null
		if (!data || typeof data !== 'object' || !('id' in data)) {
			throw new Error('CreatureSearch did not return any ids')
		}
		const firstCreatureId = data.id
		if (typeof firstCreatureId !== 'number') {
			throw new Error('CreatureSearch did not return any ids')
		}
		if (!firstCreatureId) {
			throw new Error('CreatureSearch did not return any ids')
		}
		creatureId = firstCreatureId

		const creature = await client.wow.Creature(creatureId)
		if (!creature.success) {
			throw new Error(`Creature failed: ${creature.error_type}`)
		}
		const firstDisplayId = creature.data.creature_displays?.[0]?.id
		if (!firstDisplayId) {
			throw new Error('Creature did not include display id')
		}
		displayId = firstDisplayId
	})

	it('validates creature type index endpoint', () => {
		expect(typeIndexFailures).toHaveLength(0)
	})

	it('validates creature type endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-creature-type',
			inputs: [creatureTypeId],
			call: async (id) => client.wow.CreatureType(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates creature family index endpoint', () => {
		expect(familyIndexFailures).toHaveLength(0)
	})

	it('validates creature family endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-creature-family',
			inputs: [creatureFamilyId],
			call: async (id) => client.wow.CreatueFamily(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates creature family media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-creature-family-media',
			inputs: [creatureFamilyId],
			call: async (id) => client.wow.CreatueFamilyMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates creature search endpoint', () => {
		expect(searchIndexFailures).toHaveLength(0)
	})

	it('validates creature endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-creature',
			inputs: [creatureId],
			call: async (id) => client.wow.Creature(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates creature media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-creature-media',
			inputs: [displayId],
			call: async (id) => client.wow.CreatureMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
