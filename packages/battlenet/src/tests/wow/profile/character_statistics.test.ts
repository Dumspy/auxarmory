import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'
import { resolveCharacterIdentity } from './character.helpers'

describe('battlenet wow profile character statistics', () => {
	const client = createApplicationClient()
	let realmSlug: string
	let characterName: string
	let statisticsFailures: unknown[]

	beforeAll(async () => {
		const identity = await resolveCharacterIdentity()
		realmSlug = identity.realmSlug
		characterName = identity.characterName

		const { failures } = await runEndpoint({
			name: 'wow-profile-character-statistics',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterStatisticsSummary(realmSlug, characterName),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		statisticsFailures = failures
	})

	it('validates character statistics summary endpoint', () => {
		expect(statisticsFailures).toHaveLength(0)
	})
})
