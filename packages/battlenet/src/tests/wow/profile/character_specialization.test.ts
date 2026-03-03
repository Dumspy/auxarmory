import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'
import { resolveCharacterIdentity } from './character.helpers'

describe('battlenet wow profile character specializations', () => {
	const client = createApplicationClient()
	let realmSlug: string
	let characterName: string
	let specializationFailures: unknown[]

	beforeAll(async () => {
		const identity = await resolveCharacterIdentity()
		realmSlug = identity.realmSlug
		characterName = identity.characterName

		const { failures } = await runEndpoint({
			name: 'wow-profile-character-specializations',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterSpecializationsSummary(
					realmSlug,
					characterName,
				),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		specializationFailures = failures
	})

	it('validates character specializations summary endpoint', () => {
		expect(specializationFailures).toHaveLength(0)
	})
})
