import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data item', () => {
	const client = createApplicationClient()
	let classId: number
	let subClassId: number
	let setId: number
	let itemId: number
	let classIndexFailures: unknown[]
	let setIndexFailures: unknown[]
	let searchFailures: unknown[]

	beforeAll(async () => {
		const { results: classIndexResults, failures } = await runEndpoint({
			name: 'wow-game-data-item-class-index',
			inputs: [null],
			call: async () => client.wow.ItemClassIndex(),
			saveId: () => 'root',
		})
		classIndexFailures = failures

		const firstClass =
			classIndexResults[0]?.output?.item_classes?.[0] ?? null
		if (!firstClass?.id) {
			throw new Error('ItemClassIndex did not return any ids')
		}
		classId = firstClass.id

		const itemClass = await client.wow.ItemClass(classId)
		if (!itemClass.success) {
			throw new Error(`ItemClass failed: ${itemClass.error_type}`)
		}
		const firstSubClass = itemClass.data.item_subclasses?.[0]?.id
		if (firstSubClass === undefined) {
			throw new Error('ItemClass did not include item_subclasses')
		}
		subClassId = firstSubClass

		const { results: setIndexResults, failures: itemSetFailures } =
			await runEndpoint({
				name: 'wow-game-data-item-set-index',
				inputs: [null],
				call: async () => client.wow.ItemSetIndex(),
				saveId: () => 'root',
			})
		setIndexFailures = itemSetFailures

		const firstSet = setIndexResults[0]?.output?.item_sets?.[0] ?? null
		if (!firstSet?.id) {
			throw new Error('ItemSetIndex did not return any ids')
		}
		setId = firstSet.id

		const { results: searchResults, failures: itemSearchFailures } =
			await runEndpoint({
				name: 'wow-game-data-item-search',
				inputs: [null],
				call: async () => client.wow.ItemSearch(new URLSearchParams()),
				saveId: () => 'root',
			})
		searchFailures = itemSearchFailures

		const searchResult = searchResults[0]?.output
		if (!searchResult || typeof searchResult !== 'object') {
			throw new Error('ItemSearch did not return any ids')
		}
		const results = 'results' in searchResult ? searchResult.results : null
		if (!Array.isArray(results)) {
			throw new Error('ItemSearch did not return any ids')
		}
		const firstResult = results[0]
		if (!firstResult || typeof firstResult !== 'object') {
			throw new Error('ItemSearch did not return any ids')
		}
		const data = 'data' in firstResult ? firstResult.data : null
		if (!data || typeof data !== 'object' || !('id' in data)) {
			throw new Error('ItemSearch did not return any ids')
		}
		const firstItemId = data.id
		if (typeof firstItemId !== 'number' || !firstItemId) {
			throw new Error('ItemSearch did not return any ids')
		}
		itemId = firstItemId
	})

	it('validates item class index endpoint', () => {
		expect(classIndexFailures).toHaveLength(0)
	})

	it('validates item class endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-item-class',
			inputs: [classId],
			call: async (id) => client.wow.ItemClass(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates item subclass endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-item-subclass',
			inputs: [{ classId, subClassId }],
			call: async ({ classId, subClassId }) =>
				client.wow.ItemSubClass(classId, subClassId),
			saveId: ({ classId, subClassId }) => `${classId}-${subClassId}`,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates item set index endpoint', () => {
		expect(setIndexFailures).toHaveLength(0)
	})

	it('validates item set endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-item-set',
			inputs: [setId],
			call: async (id) => client.wow.ItemSet(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates item search endpoint', () => {
		expect(searchFailures).toHaveLength(0)
	})

	it('validates item endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-item',
			inputs: [itemId],
			call: async (id) => client.wow.Item(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates item media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-item-media',
			inputs: [itemId],
			call: async (id) => client.wow.ItemMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
