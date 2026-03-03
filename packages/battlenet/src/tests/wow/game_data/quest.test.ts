import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data quest', () => {
	const client = createApplicationClient()
	let categoryId: number
	let areaId: number
	let typeId: number
	let questId: number
	let indexFailures: unknown[]
	let categoryIndexFailures: unknown[]
	let areaIndexFailures: unknown[]
	let typeIndexFailures: unknown[]

	beforeAll(async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-quest-index',
			inputs: [null],
			call: async () => client.wow.QuestIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const { results: categoryIndexResults, failures: categoryFailures } =
			await runEndpoint({
				name: 'wow-game-data-quest-category-index',
				inputs: [null],
				call: async () => client.wow.QuestCategoriesIndex(),
				saveId: () => 'root',
			})
		categoryIndexFailures = categoryFailures

		const categoryIndexResult = categoryIndexResults[0]?.output
		if (!categoryIndexResult || typeof categoryIndexResult !== 'object') {
			throw new Error('QuestCategoriesIndex did not return any ids')
		}
		const categories =
			'categories' in categoryIndexResult
				? categoryIndexResult.categories
				: null
		if (!Array.isArray(categories)) {
			throw new Error('QuestCategoriesIndex did not return any ids')
		}
		const firstCategory = categories[0]
		if (
			!firstCategory ||
			typeof firstCategory !== 'object' ||
			!('id' in firstCategory)
		) {
			throw new Error('QuestCategoriesIndex did not return any ids')
		}
		const firstCategoryId = firstCategory.id
		if (typeof firstCategoryId !== 'number' || !firstCategoryId) {
			throw new Error('QuestCategoriesIndex did not return any ids')
		}
		categoryId = firstCategoryId

		const { results: areaIndexResults, failures: areaFailures } =
			await runEndpoint({
				name: 'wow-game-data-quest-area-index',
				inputs: [null],
				call: async () => client.wow.QuestAreasIndex(),
				saveId: () => 'root',
			})
		areaIndexFailures = areaFailures

		const areaIndexResult = areaIndexResults[0]?.output
		if (!areaIndexResult || typeof areaIndexResult !== 'object') {
			throw new Error('QuestAreasIndex did not return any ids')
		}
		const areas = 'areas' in areaIndexResult ? areaIndexResult.areas : null
		if (!Array.isArray(areas)) {
			throw new Error('QuestAreasIndex did not return any ids')
		}
		const firstArea = areas[0]
		if (
			!firstArea ||
			typeof firstArea !== 'object' ||
			!('id' in firstArea)
		) {
			throw new Error('QuestAreasIndex did not return any ids')
		}
		const firstAreaId = firstArea.id
		if (typeof firstAreaId !== 'number' || !firstAreaId) {
			throw new Error('QuestAreasIndex did not return any ids')
		}
		areaId = firstAreaId

		const { results: typeIndexResults, failures: questTypeFailures } =
			await runEndpoint({
				name: 'wow-game-data-quest-type-index',
				inputs: [null],
				call: async () => client.wow.QuestTypeIndex(),
				saveId: () => 'root',
			})
		typeIndexFailures = questTypeFailures

		const typeIndexResult = typeIndexResults[0]?.output
		if (!typeIndexResult || typeof typeIndexResult !== 'object') {
			throw new Error('QuestTypeIndex did not return any ids')
		}
		const types = 'types' in typeIndexResult ? typeIndexResult.types : null
		if (!Array.isArray(types)) {
			throw new Error('QuestTypeIndex did not return any ids')
		}
		const firstType = types[0]
		if (
			!firstType ||
			typeof firstType !== 'object' ||
			!('id' in firstType)
		) {
			throw new Error('QuestTypeIndex did not return any ids')
		}
		const firstTypeId = firstType.id
		if (typeof firstTypeId !== 'number' || !firstTypeId) {
			throw new Error('QuestTypeIndex did not return any ids')
		}
		typeId = firstTypeId

		const category = await client.wow.QuestCategory(categoryId)
		if (!category.success) {
			throw new Error('QuestCategory failed')
		}
		const firstQuest = category.data.quests?.[0]?.id
		if (!firstQuest) {
			throw new Error('QuestCategory did not include quest ids')
		}
		questId = firstQuest
	})

	it('validates quest index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates quest category index endpoint', () => {
		expect(categoryIndexFailures).toHaveLength(0)
	})

	it('validates quest category endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-quest-category',
			inputs: [categoryId],
			call: async (id) => client.wow.QuestCategory(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates quest area index endpoint', () => {
		expect(areaIndexFailures).toHaveLength(0)
	})

	it('validates quest area endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-quest-area',
			inputs: [areaId],
			call: async (id) => client.wow.QuestArea(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates quest type index endpoint', () => {
		expect(typeIndexFailures).toHaveLength(0)
	})

	it('validates quest type endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-quest-type',
			inputs: [typeId],
			call: async (id) => client.wow.QuestType(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates quest endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-quest',
			inputs: [questId],
			call: async (id) => client.wow.Quest(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
