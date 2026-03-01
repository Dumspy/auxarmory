import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'
import { resolveCharacterIdentity } from './character.helpers'

describe('battlenet wow profile character profile', () => {
	const client = createApplicationClient()
	let realmSlug: string
	let characterName: string
	let summaryFailures: unknown[]
	let statusFailures: unknown[]

	beforeAll(async () => {
		const identity = await resolveCharacterIdentity()
		realmSlug = identity.realmSlug
		characterName = identity.characterName

		const { failures: summaryEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-summary',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterProfileSummary(realmSlug, characterName),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		summaryFailures = summaryEndpointFailures

		const { failures: statusEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-status',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterProfileStatus(realmSlug, characterName),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		statusFailures = statusEndpointFailures
	})

	it('validates character profile summary endpoint', () => {
		expect(summaryFailures).toHaveLength(0)
	})

	it('validates character profile status endpoint', () => {
		expect(statusFailures).toHaveLength(0)
	})
})
