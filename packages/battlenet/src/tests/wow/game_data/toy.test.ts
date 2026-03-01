import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data toy', () => {
	const client = createApplicationClient()
	let toyId: number
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-toy-index',
			inputs: [null],
			call: async () => client.wow.ToyIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const indexResult = indexResults[0]?.output
		if (!indexResult || typeof indexResult !== 'object') {
			throw new Error('ToyIndex did not return any ids')
		}
		const toys = 'toys' in indexResult ? indexResult.toys : null
		if (!Array.isArray(toys)) {
			throw new Error('ToyIndex did not return any ids')
		}
		const firstToy = toys[0]
		if (!firstToy || typeof firstToy !== 'object' || !('id' in firstToy)) {
			throw new Error('ToyIndex did not return any ids')
		}
		const firstToyId = firstToy.id
		if (typeof firstToyId !== 'number' || !firstToyId) {
			throw new Error('ToyIndex did not return any ids')
		}
		toyId = firstToyId
	})

	it('validates toy index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates toy endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-toy',
			inputs: [toyId],
			call: async (id) => client.wow.Toy(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
