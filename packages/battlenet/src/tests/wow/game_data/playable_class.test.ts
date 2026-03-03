import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data playable class', () => {
	const client = createApplicationClient()
	let classId: number
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-playable-class-index',
			inputs: [null],
			call: async () => client.wow.PlayableClassIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const indexResult = indexResults[0]?.output
		if (!indexResult || typeof indexResult !== 'object') {
			throw new Error('PlayableClassIndex did not return any ids')
		}
		const classes = 'classes' in indexResult ? indexResult.classes : null
		if (!Array.isArray(classes)) {
			throw new Error('PlayableClassIndex did not return any ids')
		}
		const firstClass = classes[0]
		if (
			!firstClass ||
			typeof firstClass !== 'object' ||
			!('id' in firstClass)
		) {
			throw new Error('PlayableClassIndex did not return any ids')
		}
		const firstClassId = firstClass.id
		if (typeof firstClassId !== 'number' || !firstClassId) {
			throw new Error('PlayableClassIndex did not return any ids')
		}
		classId = firstClassId
	})

	it('validates playable class index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates playable class endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-playable-class',
			inputs: [classId],
			call: async (id) => client.wow.PlayableClass(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates playable class media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-playable-class-media',
			inputs: [classId],
			call: async (id) => client.wow.PlayableClassMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates playable class pvp talent slots endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-playable-class-pvp-talent-slots',
			inputs: [classId],
			call: async (id) => client.wow.PlayablePvPTalentSlot(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
