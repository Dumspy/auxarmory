import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data pvp season', () => {
	const client = createApplicationClient()
	let seasonId: number
	let leaderboardName: string
	let leaderboardIndexFailures: unknown[]
	let seasonIndexFailures: unknown[]
	let rewardFailures: unknown[]

	beforeAll(async () => {
		const { results: seasonIndexResults, failures } = await runEndpoint({
			name: 'wow-game-data-pvp-season-index',
			inputs: [null],
			call: async () => client.wow.PvPSeasonIndex(),
			saveId: () => 'root',
		})
		seasonIndexFailures = failures

		const seasonIndexResult = seasonIndexResults[0]?.output
		if (!seasonIndexResult || typeof seasonIndexResult !== 'object') {
			throw new Error('PvPSeasonIndex did not return any ids')
		}
		const seasons =
			'seasons' in seasonIndexResult ? seasonIndexResult.seasons : null
		if (!Array.isArray(seasons)) {
			throw new Error('PvPSeasonIndex did not return any ids')
		}
		const firstSeason = seasons[0]
		if (
			!firstSeason ||
			typeof firstSeason !== 'object' ||
			!('id' in firstSeason)
		) {
			throw new Error('PvPSeasonIndex did not return any ids')
		}
		const firstSeasonId = firstSeason.id
		if (typeof firstSeasonId !== 'number' || !firstSeasonId) {
			throw new Error('PvPSeasonIndex did not return any ids')
		}
		seasonId = firstSeasonId

		const seasonResult = await client.wow.PvPSeason(seasonId)
		if (!seasonResult.success) {
			throw new Error('PvPSeason failed')
		}

		const {
			results: leaderboardIndexResults,
			failures: leaderboardFailures,
		} = await runEndpoint({
			name: 'wow-game-data-pvp-leaderboard-index',
			inputs: [seasonId],
			call: async (id) => client.wow.PvPLeaderboardIndex(id),
			saveId: (id) => id,
		})
		leaderboardIndexFailures = leaderboardFailures

		const leaderboardIndexResult = leaderboardIndexResults[0]?.output
		if (
			!leaderboardIndexResult ||
			typeof leaderboardIndexResult !== 'object'
		) {
			leaderboardName = ''
			return
		}
		const leaderboards =
			'leaderboards' in leaderboardIndexResult
				? leaderboardIndexResult.leaderboards
				: null
		if (!Array.isArray(leaderboards)) {
			leaderboardName = ''
			return
		}
		const firstLeaderboard = leaderboards[0]
		if (
			!firstLeaderboard ||
			typeof firstLeaderboard !== 'object' ||
			!('name' in firstLeaderboard)
		) {
			leaderboardName = ''
			return
		}
		const firstLeaderboardName = firstLeaderboard.name
		if (typeof firstLeaderboardName !== 'string' || !firstLeaderboardName) {
			leaderboardName = ''
			return
		}
		leaderboardName = firstLeaderboardName

		const { failures: rewardIndexFailures } = await runEndpoint({
			name: 'wow-game-data-pvp-reward-index',
			inputs: [seasonId],
			call: async (id) => client.wow.PvPRewardIndex(id),
			saveId: (id) => id,
		})
		rewardFailures = rewardIndexFailures
	})

	it('validates pvp season index endpoint', () => {
		expect(seasonIndexFailures).toHaveLength(0)
	})

	it('validates pvp leaderboard index endpoint', () => {
		expect(leaderboardIndexFailures).toHaveLength(0)
	})

	it('validates pvp leaderboard endpoint', async () => {
		if (!leaderboardName) return
		const { failures } = await runEndpoint({
			name: 'wow-game-data-pvp-leaderboard',
			inputs: [{ seasonId, bracket: leaderboardName }],
			call: async ({ seasonId, bracket }) =>
				client.wow.PvPLeaderboard(seasonId, bracket),
			saveId: ({ seasonId, bracket }) => `${seasonId}-${bracket}`,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates pvp reward index endpoint', () => {
		expect(rewardFailures).toHaveLength(0)
	})
})
