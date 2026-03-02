import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data profession', () => {
	const client = createApplicationClient()
	let professionId: number
	let tierId: number
	let recipeId: number
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-profession-index',
			inputs: [null],
			call: async () => client.wow.ProfessionIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const indexResult = indexResults[0]?.output
		if (!indexResult || typeof indexResult !== 'object') {
			throw new Error('ProfessionIndex did not return any ids')
		}
		const professions =
			'professions' in indexResult ? indexResult.professions : null
		if (!Array.isArray(professions)) {
			throw new Error('ProfessionIndex did not return any ids')
		}
		const firstProfession = professions[0]
		if (
			!firstProfession ||
			typeof firstProfession !== 'object' ||
			!('id' in firstProfession)
		) {
			throw new Error('ProfessionIndex did not return any ids')
		}
		const firstProfessionId = firstProfession.id
		if (typeof firstProfessionId !== 'number' || !firstProfessionId) {
			throw new Error('ProfessionIndex did not return any ids')
		}
		professionId = firstProfessionId

		const profession = await client.wow.Profession(professionId)
		if (!profession.success) {
			throw new Error(`Profession failed: ${profession.error_type}`)
		}
		const firstTier = profession.data.skill_tiers?.[0]?.id
		if (!firstTier) {
			throw new Error('Profession did not include skill tiers')
		}
		tierId = firstTier

		const tier = await client.wow.ProfessionSkillTier(professionId, tierId)
		if (!tier.success) {
			throw new Error(`ProfessionSkillTier failed: ${tier.error_type}`)
		}
		const firstRecipe = tier.data.categories?.[0]?.recipes?.[0]?.id
		if (!firstRecipe) {
			throw new Error('ProfessionSkillTier did not include recipe ids')
		}
		recipeId = firstRecipe
	})

	it('validates profession index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates profession endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-profession',
			inputs: [professionId],
			call: async (id) => client.wow.Profession(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates profession media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-profession-media',
			inputs: [professionId],
			call: async (id) => client.wow.ProfessionMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates profession skill tier endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-profession-skill-tier',
			inputs: [{ professionId, tierId }],
			call: async ({ professionId, tierId }) =>
				client.wow.ProfessionSkillTier(professionId, tierId),
			saveId: ({ professionId, tierId }) => `${professionId}-${tierId}`,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates profession recipe endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-profession-recipe',
			inputs: [recipeId],
			call: async (id) => client.wow.ProfessionRecipe(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates profession recipe media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-profession-recipe-media',
			inputs: [recipeId],
			call: async (id) => client.wow.ProfessionRecipeMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
