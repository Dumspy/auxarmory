import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'
import { resolveCharacterIdentity } from './character.helpers'

describe('battlenet wow profile character reputations', () => {
	const client = createApplicationClient()
	let realmSlug: string
	let characterName: string
	let reputationFailures: unknown[]

	beforeAll(async () => {
		const identity = await resolveCharacterIdentity()
		realmSlug = identity.realmSlug
		characterName = identity.characterName

		const { failures } = await runEndpoint({
			name: 'wow-profile-character-reputations',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterReputationSummary(realmSlug, characterName),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		reputationFailures = failures
	})

	it('validates character reputation summary endpoint', () => {
		expect(reputationFailures).toHaveLength(0)
	})
})
