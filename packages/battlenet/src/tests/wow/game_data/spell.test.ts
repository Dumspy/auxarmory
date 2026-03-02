import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data spell', () => {
	const client = createApplicationClient()
	let spellId: number
	let searchFailures: unknown[]

	beforeAll(async () => {
		const { results: searchResults, failures } = await runEndpoint({
			name: 'wow-game-data-spell-search',
			inputs: [null],
			call: async () => client.wow.SpellSearch(new URLSearchParams()),
			saveId: () => 'root',
		})
		searchFailures = failures

		const searchResult = searchResults[0]?.output
		if (!searchResult || typeof searchResult !== 'object') {
			throw new Error('SpellSearch did not return any ids')
		}
		const results = 'results' in searchResult ? searchResult.results : null
		if (!Array.isArray(results)) {
			throw new Error('SpellSearch did not return any ids')
		}
		const firstResult = results[0]
		if (!firstResult || typeof firstResult !== 'object') {
			throw new Error('SpellSearch did not return any ids')
		}
		const data = 'data' in firstResult ? firstResult.data : null
		if (!data || typeof data !== 'object' || !('id' in data)) {
			throw new Error('SpellSearch did not return any ids')
		}
		const firstSpellId = data.id
		if (typeof firstSpellId !== 'number' || !firstSpellId) {
			throw new Error('SpellSearch did not return any ids')
		}
		spellId = firstSpellId
	})

	it('validates spell search endpoint', () => {
		expect(searchFailures).toHaveLength(0)
	})

	it('validates spell endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-spell',
			inputs: [spellId],
			call: async (id) => client.wow.Spell(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates spell media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-spell-media',
			inputs: [spellId],
			call: async (id) => client.wow.SpellMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
