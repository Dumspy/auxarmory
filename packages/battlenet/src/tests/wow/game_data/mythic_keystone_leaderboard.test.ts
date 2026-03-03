import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { extractNumericId, runEndpoint } from '../../harness'

describe('battlenet wow game data mythic keystone leaderboard', () => {
	const client = createApplicationClient()
	let connectedRealmId: number
	let dungeonId: number
	let seasonId: number
	let realmIndexFailures: unknown[]
	let dungeonIndexFailures: unknown[]
	let seasonIndexFailures: unknown[]
	let leaderboardIndexFailures: unknown[]

	beforeAll(async () => {
		const { results: realmIndexResults, failures } = await runEndpoint({
			name: 'wow-game-data-connected-realm-index',
			inputs: [null],
			call: async () => client.wow.ConnectedRealmIndex(),
			saveId: () => 'root',
		})
		realmIndexFailures = failures

		const realmHref =
			realmIndexResults[0]?.output?.connected_realms?.[0]?.href
		const extractedRealmId = extractNumericId(realmHref)
		if (!extractedRealmId) {
			throw new Error('ConnectedRealmIndex did not return any ids')
		}
		connectedRealmId = extractedRealmId

		const { results: dungeonIndexResults, failures: dungeonFailures } =
			await runEndpoint({
				name: 'wow-game-data-mythic-keystone-dungeon-index',
				inputs: [null],
				call: async () => client.wow.MythicKeystoneDungeonIndex(),
				saveId: () => 'root',
			})
		dungeonIndexFailures = dungeonFailures

		const dungeonIndexResult = dungeonIndexResults[0]?.output
		if (!dungeonIndexResult || typeof dungeonIndexResult !== 'object') {
			throw new Error('MythicKeystoneDungeonIndex did not return any ids')
		}
		const dungeons =
			'dungeons' in dungeonIndexResult
				? dungeonIndexResult.dungeons
				: null
		if (!Array.isArray(dungeons)) {
			throw new Error('MythicKeystoneDungeonIndex did not return any ids')
		}
		const firstDungeon = dungeons[0]
		if (
			!firstDungeon ||
			typeof firstDungeon !== 'object' ||
			!('id' in firstDungeon)
		) {
			throw new Error('MythicKeystoneDungeonIndex did not return any ids')
		}
		const firstDungeonId = firstDungeon.id
		if (typeof firstDungeonId !== 'number' || !firstDungeonId) {
			throw new Error('MythicKeystoneDungeonIndex did not return any ids')
		}
		dungeonId = firstDungeonId

		const { results: seasonIndexResults, failures: seasonFailures } =
			await runEndpoint({
				name: 'wow-game-data-mythic-keystone-season-index',
				inputs: [null],
				call: async () => client.wow.MythicKeystoneSeasonIndex(),
				saveId: () => 'root',
			})
		seasonIndexFailures = seasonFailures

		const seasonIndexResult = seasonIndexResults[0]?.output
		if (!seasonIndexResult || typeof seasonIndexResult !== 'object') {
			throw new Error('MythicKeystoneSeasonIndex did not return any ids')
		}
		const seasons =
			'seasons' in seasonIndexResult ? seasonIndexResult.seasons : null
		if (!Array.isArray(seasons)) {
			throw new Error('MythicKeystoneSeasonIndex did not return any ids')
		}
		const firstSeason = seasons[0]
		if (
			!firstSeason ||
			typeof firstSeason !== 'object' ||
			!('id' in firstSeason)
		) {
			throw new Error('MythicKeystoneSeasonIndex did not return any ids')
		}
		const firstSeasonId = firstSeason.id
		if (typeof firstSeasonId !== 'number' || !firstSeasonId) {
			throw new Error('MythicKeystoneSeasonIndex did not return any ids')
		}
		seasonId = firstSeasonId

		const { failures: indexFailures } = await runEndpoint({
			name: 'wow-game-data-mythic-keystone-leaderboard-index',
			inputs: [connectedRealmId],
			call: async (id) => client.wow.MythicKeystoneLeaderboardIndex(id),
			saveId: (id) => id,
		})
		leaderboardIndexFailures = indexFailures
	})

	it('validates connected realm index endpoint', () => {
		expect(realmIndexFailures).toHaveLength(0)
	})

	it('validates mythic keystone dungeon index endpoint', () => {
		expect(dungeonIndexFailures).toHaveLength(0)
	})

	it('validates mythic keystone season index endpoint', () => {
		expect(seasonIndexFailures).toHaveLength(0)
	})

	it('validates mythic keystone leaderboard index endpoint', () => {
		expect(leaderboardIndexFailures).toHaveLength(0)
	})

	it('validates mythic keystone leaderboard endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-mythic-keystone-leaderboard',
			inputs: [{ connectedRealmId, dungeonId, seasonId }],
			call: async ({ connectedRealmId, dungeonId, seasonId }) =>
				client.wow.MythicKeystoneLeaderboard(
					connectedRealmId,
					dungeonId,
					seasonId,
				),
			saveId: ({ connectedRealmId, dungeonId, seasonId }) =>
				`${connectedRealmId}-${dungeonId}-${seasonId}`,
		})
		expect(failures).toHaveLength(0)
	})
})
