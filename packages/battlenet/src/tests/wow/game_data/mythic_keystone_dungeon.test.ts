import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data mythic keystone dungeon', () => {
	const client = createApplicationClient()
	let dungeonId: number
	let periodId: number
	let seasonId: number
	let indexFailures: unknown[]
	let dungeonIndexFailures: unknown[]
	let periodIndexFailures: unknown[]
	let seasonIndexFailures: unknown[]

	beforeAll(async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-mythic-keystone-index',
			inputs: [null],
			call: async () => client.wow.MythicKeystoneIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

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

		const { results: periodIndexResults, failures: periodFailures } =
			await runEndpoint({
				name: 'wow-game-data-mythic-keystone-period-index',
				inputs: [null],
				call: async () => client.wow.MythicKeystonePeriodIndex(),
				saveId: () => 'root',
			})
		periodIndexFailures = periodFailures

		const periodIndexResult = periodIndexResults[0]?.output
		if (!periodIndexResult || typeof periodIndexResult !== 'object') {
			throw new Error('MythicKeystonePeriodIndex did not return any ids')
		}
		const periods =
			'periods' in periodIndexResult ? periodIndexResult.periods : null
		if (!Array.isArray(periods)) {
			throw new Error('MythicKeystonePeriodIndex did not return any ids')
		}
		const firstPeriod = periods[0]
		if (
			!firstPeriod ||
			typeof firstPeriod !== 'object' ||
			!('id' in firstPeriod)
		) {
			throw new Error('MythicKeystonePeriodIndex did not return any ids')
		}
		const firstPeriodId = firstPeriod.id
		if (typeof firstPeriodId !== 'number' || !firstPeriodId) {
			throw new Error('MythicKeystonePeriodIndex did not return any ids')
		}
		periodId = firstPeriodId

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
	})

	it('validates mythic keystone index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates mythic keystone dungeon index endpoint', () => {
		expect(dungeonIndexFailures).toHaveLength(0)
	})

	it('validates mythic keystone dungeon endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-mythic-keystone-dungeon',
			inputs: [dungeonId],
			call: async (id) => client.wow.MythicKeystoneDungeon(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates mythic keystone period index endpoint', () => {
		expect(periodIndexFailures).toHaveLength(0)
	})

	it('validates mythic keystone period endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-mythic-keystone-period',
			inputs: [periodId],
			call: async (id) => client.wow.MythicKeystonePeriod(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates mythic keystone season index endpoint', () => {
		expect(seasonIndexFailures).toHaveLength(0)
	})

	it('validates mythic keystone season endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-mythic-keystone-season',
			inputs: [seasonId],
			call: async (id) => client.wow.MythicKeystoneSeason(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
