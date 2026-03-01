import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data playable race', () => {
	const client = createApplicationClient()
	let raceId: number
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-playable-race-index',
			inputs: [null],
			call: async () => client.wow.PlayableRaceIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const indexResult = indexResults[0]?.output
		if (!indexResult || typeof indexResult !== 'object') {
			throw new Error('PlayableRaceIndex did not return any ids')
		}
		const races = 'races' in indexResult ? indexResult.races : null
		if (!Array.isArray(races)) {
			throw new Error('PlayableRaceIndex did not return any ids')
		}
		const firstRace = races[0]
		if (
			!firstRace ||
			typeof firstRace !== 'object' ||
			!('id' in firstRace)
		) {
			throw new Error('PlayableRaceIndex did not return any ids')
		}
		const firstRaceId = firstRace.id
		if (typeof firstRaceId !== 'number' || !firstRaceId) {
			throw new Error('PlayableRaceIndex did not return any ids')
		}
		raceId = firstRaceId
	})

	it('validates playable race index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates playable race endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-playable-race',
			inputs: [raceId],
			call: async (id) => client.wow.PlayableRace(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
