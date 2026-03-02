import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'
import { resolveCharacterIdentity } from './character.helpers'

describe('battlenet wow profile character soulbinds', () => {
	const client = createApplicationClient()
	let realmSlug: string
	let characterName: string
	let soulbindFailures: unknown[]

	beforeAll(async () => {
		const identity = await resolveCharacterIdentity()
		realmSlug = identity.realmSlug
		characterName = identity.characterName

		const { failures } = await runEndpoint({
			name: 'wow-profile-character-soulbinds',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterSoulbinds(realmSlug, characterName),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		soulbindFailures = failures
	})

	it('validates character soulbinds endpoint', () => {
		expect(soulbindFailures).toHaveLength(0)
	})
})
