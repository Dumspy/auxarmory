import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data pets', () => {
	const client = createApplicationClient()
	let petId: number
	let abilityId: number
	let petIndexFailures: unknown[]
	let abilityIndexFailures: unknown[]

	beforeAll(async () => {
		const { results: petIndexResults, failures } = await runEndpoint({
			name: 'wow-game-data-pet-index',
			inputs: [null],
			call: async () => client.wow.PetIndex(),
			saveId: () => 'root',
		})
		petIndexFailures = failures

		const petIndexResult = petIndexResults[0]?.output
		if (!petIndexResult || typeof petIndexResult !== 'object') {
			throw new Error('PetIndex did not return any ids')
		}
		const pets = 'pets' in petIndexResult ? petIndexResult.pets : null
		if (!Array.isArray(pets)) {
			throw new Error('PetIndex did not return any ids')
		}
		const firstPet = pets[0]
		if (!firstPet || typeof firstPet !== 'object' || !('id' in firstPet)) {
			throw new Error('PetIndex did not return any ids')
		}
		const firstPetId = firstPet.id
		if (typeof firstPetId !== 'number' || !firstPetId) {
			throw new Error('PetIndex did not return any ids')
		}
		petId = firstPetId

		const { results: abilityIndexResults, failures: abilityFailures } =
			await runEndpoint({
				name: 'wow-game-data-pet-ability-index',
				inputs: [null],
				call: async () => client.wow.PetAbilitiesIndex(),
				saveId: () => 'root',
			})
		abilityIndexFailures = abilityFailures

		const abilityIndexResult = abilityIndexResults[0]?.output
		if (!abilityIndexResult || typeof abilityIndexResult !== 'object') {
			throw new Error('PetAbilitiesIndex did not return any ids')
		}
		const abilities =
			'abilities' in abilityIndexResult
				? abilityIndexResult.abilities
				: null
		if (!Array.isArray(abilities)) {
			throw new Error('PetAbilitiesIndex did not return any ids')
		}
		const firstAbility = abilities[0]
		if (
			!firstAbility ||
			typeof firstAbility !== 'object' ||
			!('id' in firstAbility)
		) {
			throw new Error('PetAbilitiesIndex did not return any ids')
		}
		const firstAbilityId = firstAbility.id
		if (typeof firstAbilityId !== 'number' || !firstAbilityId) {
			throw new Error('PetAbilitiesIndex did not return any ids')
		}
		abilityId = firstAbilityId
	})

	it('validates pet index endpoint', () => {
		expect(petIndexFailures).toHaveLength(0)
	})

	it('validates pet endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-pet',
			inputs: [petId],
			call: async (id) => client.wow.Pet(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates pet media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-pet-media',
			inputs: [petId],
			call: async (id) => client.wow.PetMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates pet ability index endpoint', () => {
		expect(abilityIndexFailures).toHaveLength(0)
	})

	it('validates pet ability endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-pet-ability',
			inputs: [abilityId],
			call: async (id) => client.wow.PetAbility(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates pet ability media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-pet-ability-media',
			inputs: [abilityId],
			call: async (id) => client.wow.PetAbilityMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
