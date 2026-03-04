import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'
import { resolveCharacterIdentity } from './character.helpers'

describe('battlenet wow profile character house', () => {
	const client = createApplicationClient()
	let realmSlug: string
	let characterName: string

	beforeAll(async () => {
		const identity = await resolveCharacterIdentity()
		realmSlug = identity.realmSlug
		characterName = identity.characterName
	})

	it('validates character house summary endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-profile-character-house-summary',
			inputs: [{ realmSlug, characterName, houseNumber: 1 }],
			call: async ({ realmSlug, characterName, houseNumber }) =>
				client.wow.CharacterHouseSummary(
					realmSlug,
					characterName,
					houseNumber,
				),
			saveId: ({ realmSlug, characterName, houseNumber }) =>
				`${realmSlug}-${characterName}-${houseNumber}`,
		})
		expect(failures).toHaveLength(0)
	})
})
