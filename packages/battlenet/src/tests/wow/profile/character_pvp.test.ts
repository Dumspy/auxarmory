import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'
import { resolveCharacterIdentity } from './character.helpers'

describe('battlenet wow profile character pvp', () => {
	const client = createApplicationClient()
	let realmSlug: string
	let characterName: string
	let summaryFailures: unknown[]
	let bracketFailures: unknown[]

	beforeAll(async () => {
		const identity = await resolveCharacterIdentity()
		realmSlug = identity.realmSlug
		characterName = identity.characterName

		const { failures: summaryEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-pvp-summary',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterPvPSummary(realmSlug, characterName),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		summaryFailures = summaryEndpointFailures

		const { failures: bracketEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-pvp-bracket',
			inputs: [{ realmSlug, characterName, bracket: 'ARENA_2v2' }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterPvPBracketStatistics(
					realmSlug,
					characterName,
					'ARENA_2v2',
				),
			saveId: ({ realmSlug, characterName, bracket }) =>
				`${realmSlug}-${characterName}-${bracket}`,
		})
		bracketFailures = bracketEndpointFailures
	})

	it('validates character pvp summary endpoint', () => {
		expect(summaryFailures).toHaveLength(0)
	})

	it('validates character pvp bracket endpoint', () => {
		expect(bracketFailures).toHaveLength(0)
	})
})
