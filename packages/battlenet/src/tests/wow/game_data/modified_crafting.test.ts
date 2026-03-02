import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data modified crafting', () => {
	const client = createApplicationClient()
	let categoryId: number | null
	let slotId: number | null
	let indexFailures: unknown[]
	let categoryIndexFailures: unknown[]
	let slotIndexFailures: unknown[]

	beforeAll(async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-modified-crafting-index',
			inputs: [null],
			call: async () => client.wow.ModifiedCraftingIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const { results: categoryIndexResults, failures: categoryFailures } =
			await runEndpoint({
				name: 'wow-game-data-modified-crafting-category-index',
				inputs: [null],
				call: async () => client.wow.ModifiedCraftingCategoryIndex(),
				saveId: () => 'root',
			})
		categoryIndexFailures = categoryFailures

		const categoryResult = categoryIndexResults[0]?.output
		if (!categoryResult || typeof categoryResult !== 'object') {
			categoryId = null
			return
		}
		const categories =
			'categories' in categoryResult ? categoryResult.categories : null
		if (!Array.isArray(categories)) {
			categoryId = null
			return
		}
		const firstCategory = categories[0]
		if (
			!firstCategory ||
			typeof firstCategory !== 'object' ||
			!('id' in firstCategory)
		) {
			categoryId = null
			return
		}
		const firstCategoryId = firstCategory.id
		categoryId =
			typeof firstCategoryId === 'number' && firstCategoryId
				? firstCategoryId
				: null

		const { results: slotIndexResults, failures: reagentFailures } =
			await runEndpoint({
				name: 'wow-game-data-modified-crafting-reagent-slot-type-index',
				inputs: [null],
				call: async () =>
					client.wow.ModifiedCraftingReagentSlotTypeIndex(),
				saveId: () => 'root',
			})
		slotIndexFailures = reagentFailures

		const slotResult = slotIndexResults[0]?.output
		if (!slotResult || typeof slotResult !== 'object') {
			slotId = null
			return
		}
		const slotTypes =
			'reagent_slot_types' in slotResult
				? slotResult.reagent_slot_types
				: null
		if (!Array.isArray(slotTypes)) {
			slotId = null
			return
		}
		const firstSlot = slotTypes[0]
		if (
			!firstSlot ||
			typeof firstSlot !== 'object' ||
			!('id' in firstSlot)
		) {
			slotId = null
			return
		}
		const firstSlotId = firstSlot.id
		slotId =
			typeof firstSlotId === 'number' && firstSlotId ? firstSlotId : null
	})

	it('validates modified crafting index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates modified crafting category index endpoint', () => {
		expect(categoryIndexFailures).toHaveLength(0)
	})

	it('validates modified crafting category endpoint', async () => {
		if (!categoryId) return
		const { failures } = await runEndpoint({
			name: 'wow-game-data-modified-crafting-category',
			inputs: [categoryId],
			call: async (id) => client.wow.ModifiedCraftingCategory(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates modified crafting reagent slot type index endpoint', () => {
		expect(slotIndexFailures).toHaveLength(0)
	})

	it('validates modified crafting reagent slot type endpoint', async () => {
		if (!slotId) return
		const { failures } = await runEndpoint({
			name: 'wow-game-data-modified-crafting-reagent-slot-type',
			inputs: [slotId],
			call: async (id) => client.wow.ModifiedCraftingReagentSlotType(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
