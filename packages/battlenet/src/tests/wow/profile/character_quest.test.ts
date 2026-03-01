import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'
import { resolveCharacterIdentity } from './character.helpers'

describe('battlenet wow profile character quests', () => {
	const client = createApplicationClient()
	let realmSlug: string
	let characterName: string
	let summaryFailures: unknown[]
	let completedFailures: unknown[]

	beforeAll(async () => {
		const identity = await resolveCharacterIdentity()
		realmSlug = identity.realmSlug
		characterName = identity.characterName

		const { failures: summaryEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-quests-summary',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterQuests(realmSlug, characterName),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		summaryFailures = summaryEndpointFailures

		const { failures: completedEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-quests-completed',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterCompletedQuests(realmSlug, characterName),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		completedFailures = completedEndpointFailures
	})

	it('validates character quests summary endpoint', () => {
		expect(summaryFailures).toHaveLength(0)
	})

	it('validates character quests completed endpoint', () => {
		expect(completedFailures).toHaveLength(0)
	})
})
