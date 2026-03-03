import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data achievements', () => {
	const client = createApplicationClient()
	let achievementId: number | null
	let categoryId: number | null
	let indexFailures: unknown[]
	let categoryIndexFailures: unknown[]

	beforeAll(async () => {
		const { results, failures } = await runEndpoint({
			name: 'wow-game-data-achievements-index',
			inputs: [null],
			call: async () => client.wow.AchievementsIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const firstAchievement = results[0]?.output?.achievements?.[0] ?? null
		achievementId = firstAchievement?.id ?? null

		const { results: categoryResults, failures: categoryFailures } =
			await runEndpoint({
				name: 'wow-game-data-achievement-category-index',
				inputs: [null],
				call: async () => client.wow.AchievementCategoryIndex(),
				saveId: () => 'root',
			})
		categoryIndexFailures = categoryFailures

		const firstCategory =
			categoryResults[0]?.output?.categories?.[0] ?? null
		categoryId = firstCategory?.id ?? null
	})

	it('validates achievements index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates achievement endpoint', async () => {
		if (!achievementId) return
		const { failures } = await runEndpoint({
			name: 'wow-game-data-achievement',
			inputs: [achievementId],
			call: async (id) => client.wow.Achievement(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates achievement media endpoint', async () => {
		if (!achievementId) return
		const { failures } = await runEndpoint({
			name: 'wow-game-data-achievement-media',
			inputs: [achievementId],
			call: async (id) => client.wow.AchievementMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates achievement category index endpoint', () => {
		expect(categoryIndexFailures).toHaveLength(0)
	})

	it('validates achievement category endpoint', async () => {
		if (!categoryId) return
		const { failures } = await runEndpoint({
			name: 'wow-game-data-achievement-category',
			inputs: [categoryId],
			call: async (id) => client.wow.AchievementCategory(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
