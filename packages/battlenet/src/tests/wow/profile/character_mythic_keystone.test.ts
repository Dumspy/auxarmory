import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'
import { resolveCharacterIdentity } from './character.helpers'

describe('battlenet wow profile character mythic keystone', () => {
	const client = createApplicationClient()
	let realmSlug: string
	let characterName: string
	let seasonId: number | null
	let indexFailures: unknown[]
	let seasonFailures: unknown[]

	beforeAll(async () => {
		const identity = await resolveCharacterIdentity()
		realmSlug = identity.realmSlug
		characterName = identity.characterName

		const profile = await client.wow.CharacterMythicKeystoneProfileIndex(
			realmSlug,
			characterName,
		)
		if (!profile.success) {
			throw new Error(
				`CharacterMythicKeystoneProfileIndex failed: ${profile.error_type}`,
			)
		}
		seasonId = profile.data.seasons?.[0]?.id ?? null

		const { failures: indexEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-mythic-keystone-index',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterMythicKeystoneProfileIndex(
					realmSlug,
					characterName,
				),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		indexFailures = indexEndpointFailures

		if (seasonId) {
			const { failures: seasonEndpointFailures } = await runEndpoint({
				name: 'wow-profile-character-mythic-keystone-season',
				inputs: [{ realmSlug, characterName, seasonId }],
				call: async ({ realmSlug, characterName, seasonId }) =>
					client.wow.CharacterMythicKeystoneSeason(
						realmSlug,
						characterName,
						seasonId,
					),
				saveId: ({ realmSlug, characterName, seasonId }) =>
					`${realmSlug}-${characterName}-${seasonId}`,
			})
			seasonFailures = seasonEndpointFailures
		} else {
			seasonFailures = []
		}
	})

	it('validates character mythic keystone profile index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates character mythic keystone season endpoint', () => {
		if (!seasonId) return
		expect(seasonFailures).toHaveLength(0)
	})
})
