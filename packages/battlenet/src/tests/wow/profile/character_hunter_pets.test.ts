import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'
import { resolveCharacterIdentity } from './character.helpers'

describe('battlenet wow profile character hunter pets', () => {
	const client = createApplicationClient()
	let realmSlug: string
	let characterName: string
	let petsFailures: unknown[]

	beforeAll(async () => {
		const identity = await resolveCharacterIdentity()
		realmSlug = identity.realmSlug
		characterName = identity.characterName

		const { failures } = await runEndpoint({
			name: 'wow-profile-character-hunter-pets',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterHunterPetsSummary(realmSlug, characterName),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		petsFailures = failures
	})

	it('validates character hunter pets summary endpoint', () => {
		expect(petsFailures).toHaveLength(0)
	})
})
