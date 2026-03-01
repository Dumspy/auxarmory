import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'
import { resolveCharacterIdentity } from './character.helpers'

describe('battlenet wow profile character titles', () => {
	const client = createApplicationClient()
	let realmSlug: string
	let characterName: string
	let titlesFailures: unknown[]

	beforeAll(async () => {
		const identity = await resolveCharacterIdentity()
		realmSlug = identity.realmSlug
		characterName = identity.characterName

		const { failures } = await runEndpoint({
			name: 'wow-profile-character-titles',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterTitlesSummary(realmSlug, characterName),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		titlesFailures = failures
	})

	it('validates character titles summary endpoint', () => {
		expect(titlesFailures).toHaveLength(0)
	})
})
