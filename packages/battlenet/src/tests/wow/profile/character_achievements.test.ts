import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'
import { resolveCharacterIdentity } from './character.helpers'

describe('battlenet wow profile character achievements', () => {
	const client = createApplicationClient()
	let realmSlug: string
	let characterName: string
	let summaryFailures: unknown[]
	let statsFailures: unknown[]

	beforeAll(async () => {
		const identity = await resolveCharacterIdentity()
		realmSlug = identity.realmSlug
		characterName = identity.characterName

		const { failures: summaryEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-achievements-summary',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterAchievementsSummary(
					realmSlug,
					characterName,
				),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		summaryFailures = summaryEndpointFailures

		const { failures: statsEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-achievements-statistics',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterAchievementsStatistics(
					realmSlug,
					characterName,
				),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		statsFailures = statsEndpointFailures
	})

	it('validates character achievements summary endpoint', () => {
		expect(summaryFailures).toHaveLength(0)
	})

	it('validates character achievements statistics endpoint', () => {
		expect(statsFailures).toHaveLength(0)
	})
})
