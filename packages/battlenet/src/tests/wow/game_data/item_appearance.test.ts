import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data item appearance', () => {
	const client = createApplicationClient()
	let appearanceId: number | null
	let setId: number | null
	let slotType: string | null
	let searchFailures: unknown[]
	let setIndexFailures: unknown[]
	let slotIndexFailures: unknown[]

	beforeAll(async () => {
		const { results: searchResults, failures } = await runEndpoint({
			name: 'wow-game-data-item-appearance-search',
			inputs: [null],
			call: async () =>
				client.wow.ItemAppearanceSearch(new URLSearchParams()),
			saveId: () => 'root',
		})
		searchFailures = failures

		const searchResult = searchResults[0]?.output
		if (!searchResult || typeof searchResult !== 'object') {
			appearanceId = null
			return
		}
		const searchItems =
			'results' in searchResult ? searchResult.results : null
		if (!Array.isArray(searchItems)) {
			appearanceId = null
			return
		}
		const firstItem = searchItems[0]
		if (!firstItem || typeof firstItem !== 'object') {
			appearanceId = null
			return
		}
		const itemData = 'data' in firstItem ? firstItem.data : null
		if (!itemData || typeof itemData !== 'object' || !('id' in itemData)) {
			appearanceId = null
			return
		}
		const firstAppearanceId = itemData.id
		appearanceId =
			typeof firstAppearanceId === 'number' && firstAppearanceId
				? firstAppearanceId
				: null

		const { results: setResults, failures: setFailures } =
			await runEndpoint({
				name: 'wow-game-data-item-appearance-set-index',
				inputs: [null],
				call: async () => client.wow.ItemAppearanceSetIndex(),
				saveId: () => 'root',
			})
		setIndexFailures = setFailures

		const setResult = setResults[0]?.output
		if (!setResult || typeof setResult !== 'object') {
			setId = null
			return
		}
		const appearanceSets =
			'appearance_sets' in setResult ? setResult.appearance_sets : null
		if (!Array.isArray(appearanceSets)) {
			setId = null
			return
		}
		const firstSet = appearanceSets[0]
		if (!firstSet || typeof firstSet !== 'object' || !('id' in firstSet)) {
			setId = null
			return
		}
		const firstSetId = firstSet.id
		setId = typeof firstSetId === 'number' && firstSetId ? firstSetId : null

		const { results: slotResults, failures: slotFailures } =
			await runEndpoint({
				name: 'wow-game-data-item-appearance-slot-index',
				inputs: [null],
				call: async () => client.wow.ItemAppearanceSlotIndex(),
				saveId: () => 'root',
			})
		slotIndexFailures = slotFailures

		const slotResult = slotResults[0]?.output
		if (!slotResult || typeof slotResult !== 'object') {
			slotType = null
			return
		}
		const slots = 'slots' in slotResult ? slotResult.slots : null
		if (!Array.isArray(slots)) {
			slotType = null
			return
		}
		const firstSlot = slots[0]
		if (
			!firstSlot ||
			typeof firstSlot !== 'object' ||
			!('type' in firstSlot)
		) {
			slotType = null
			return
		}
		const firstSlotType = firstSlot.type
		slotType =
			typeof firstSlotType === 'string' && firstSlotType
				? firstSlotType
				: null
	})

	it('validates item appearance search endpoint', () => {
		expect(searchFailures).toHaveLength(0)
	})

	it('validates item appearance endpoint', async () => {
		if (!appearanceId) return
		const { failures } = await runEndpoint({
			name: 'wow-game-data-item-appearance',
			inputs: [appearanceId],
			call: async (id) => client.wow.ItemAppearance(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates item appearance set index endpoint', () => {
		expect(setIndexFailures).toHaveLength(0)
	})

	it('validates item appearance set endpoint', async () => {
		if (!setId) return
		const { failures } = await runEndpoint({
			name: 'wow-game-data-item-appearance-set',
			inputs: [setId],
			call: async (id) => client.wow.ItemAppearanceSet(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates item appearance slot index endpoint', () => {
		expect(slotIndexFailures).toHaveLength(0)
	})

	it('validates item appearance slot endpoint', async () => {
		if (!slotType) return
		const { failures } = await runEndpoint({
			name: 'wow-game-data-item-appearance-slot',
			inputs: [slotType],
			call: async (type) => client.wow.ItemAppearanceSlot(type),
			saveId: (type) => type,
		})
		expect(failures).toHaveLength(0)
	})
})
