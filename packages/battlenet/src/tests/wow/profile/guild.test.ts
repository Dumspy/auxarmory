import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'
import { resolveCharacterWithGuild } from './character.helpers'

describe('battlenet wow profile guild', () => {
	const client = createApplicationClient()
	let guildRealmSlug: string
	let guildNameSlug: string
	let guildFailures: unknown[]
	let activityFailures: unknown[]
	let achievementsFailures: unknown[]
	let rosterFailures: unknown[]

	beforeAll(async () => {
		const identity = await resolveCharacterWithGuild()
		guildRealmSlug = identity.guildRealmSlug
		guildNameSlug = identity.guildNameSlug

		const { failures: guildEndpointFailures } = await runEndpoint({
			name: 'wow-profile-guild',
			inputs: [{ guildRealmSlug, guildNameSlug }],
			call: async ({ guildRealmSlug, guildNameSlug }) =>
				client.wow.Guild(guildRealmSlug, guildNameSlug),
			saveId: ({ guildRealmSlug, guildNameSlug }) =>
				`${guildRealmSlug}-${guildNameSlug}`,
		})
		guildFailures = guildEndpointFailures

		const { failures: activityEndpointFailures } = await runEndpoint({
			name: 'wow-profile-guild-activity',
			inputs: [{ guildRealmSlug, guildNameSlug }],
			call: async ({ guildRealmSlug, guildNameSlug }) =>
				client.wow.GuildActivity(guildRealmSlug, guildNameSlug),
			saveId: ({ guildRealmSlug, guildNameSlug }) =>
				`${guildRealmSlug}-${guildNameSlug}`,
		})
		activityFailures = activityEndpointFailures

		const { failures: achievementsEndpointFailures } = await runEndpoint({
			name: 'wow-profile-guild-achievements',
			inputs: [{ guildRealmSlug, guildNameSlug }],
			call: async ({ guildRealmSlug, guildNameSlug }) =>
				client.wow.GuildAchievements(guildRealmSlug, guildNameSlug),
			saveId: ({ guildRealmSlug, guildNameSlug }) =>
				`${guildRealmSlug}-${guildNameSlug}`,
		})
		achievementsFailures = achievementsEndpointFailures

		const { failures: rosterEndpointFailures } = await runEndpoint({
			name: 'wow-profile-guild-roster',
			inputs: [{ guildRealmSlug, guildNameSlug }],
			call: async ({ guildRealmSlug, guildNameSlug }) =>
				client.wow.GuildRoster(guildRealmSlug, guildNameSlug),
			saveId: ({ guildRealmSlug, guildNameSlug }) =>
				`${guildRealmSlug}-${guildNameSlug}`,
		})
		rosterFailures = rosterEndpointFailures
	})

	it('validates guild endpoint', () => {
		expect(guildFailures).toHaveLength(0)
	})

	it('validates guild activity endpoint', () => {
		expect(activityFailures).toHaveLength(0)
	})

	it('validates guild achievements endpoint', () => {
		expect(achievementsFailures).toHaveLength(0)
	})

	it('validates guild roster endpoint', () => {
		expect(rosterFailures).toHaveLength(0)
	})
})
