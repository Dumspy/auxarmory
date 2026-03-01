import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data playable specialization', () => {
	const client = createApplicationClient()
	let specId: number
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-playable-specialization-index',
			inputs: [null],
			call: async () => client.wow.PlayableSpecializationIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const indexResult = indexResults[0]?.output
		if (!indexResult || typeof indexResult !== 'object') {
			throw new Error(
				'PlayableSpecializationIndex did not return any ids',
			)
		}
		const specs =
			'character_specializations' in indexResult
				? indexResult.character_specializations
				: null
		if (!Array.isArray(specs)) {
			throw new Error(
				'PlayableSpecializationIndex did not return any ids',
			)
		}
		const firstSpec = specs[0]
		if (
			!firstSpec ||
			typeof firstSpec !== 'object' ||
			!('id' in firstSpec)
		) {
			throw new Error(
				'PlayableSpecializationIndex did not return any ids',
			)
		}
		const firstSpecId = firstSpec.id
		if (typeof firstSpecId !== 'number' || !firstSpecId) {
			throw new Error(
				'PlayableSpecializationIndex did not return any ids',
			)
		}
		specId = firstSpecId
	})

	it('validates playable specialization index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates playable specialization endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-playable-specialization',
			inputs: [specId],
			call: async (id) => client.wow.PlayableSpecialization(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates playable specialization media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-playable-specialization-media',
			inputs: [specId],
			call: async (id) => client.wow.PlayableSpecializationMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
