import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'
import { resolveCharacterIdentity } from './character.helpers'

describe('battlenet wow profile character encounters', () => {
	const client = createApplicationClient()
	let realmSlug: string
	let characterName: string
	let summaryFailures: unknown[]
	let dungeonsFailures: unknown[]
	let raidsFailures: unknown[]

	beforeAll(async () => {
		const identity = await resolveCharacterIdentity()
		realmSlug = identity.realmSlug
		characterName = identity.characterName

		const { failures: summaryEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-encounters-summary',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterEncounterSummary(realmSlug, characterName),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		summaryFailures = summaryEndpointFailures

		const { failures: dungeonEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-encounters-dungeons',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterDungeons(realmSlug, characterName),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		dungeonsFailures = dungeonEndpointFailures

		const { failures: raidEndpointFailures } = await runEndpoint({
			name: 'wow-profile-character-encounters-raids',
			inputs: [{ realmSlug, characterName }],
			call: async ({ realmSlug, characterName }) =>
				client.wow.CharacterRaid(realmSlug, characterName),
			saveId: ({ realmSlug, characterName }) =>
				`${realmSlug}-${characterName}`,
		})
		raidsFailures = raidEndpointFailures
	})

	it('validates character encounter summary endpoint', () => {
		expect(summaryFailures).toHaveLength(0)
	})

	it('validates character encounter dungeons endpoint', () => {
		expect(dungeonsFailures).toHaveLength(0)
	})

	it('validates character encounter raids endpoint', () => {
		expect(raidsFailures).toHaveLength(0)
	})
})
