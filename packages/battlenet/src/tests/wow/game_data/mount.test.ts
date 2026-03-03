import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data mount', () => {
	const client = createApplicationClient()
	let mountId: number
	let indexFailures: unknown[]
	let searchFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-mount-index',
			inputs: [null],
			call: async () => client.wow.MountIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const indexResult = indexResults[0]?.output
		if (!indexResult || typeof indexResult !== 'object') {
			throw new Error('MountIndex did not return any ids')
		}
		const mounts = 'mounts' in indexResult ? indexResult.mounts : null
		if (!Array.isArray(mounts)) {
			throw new Error('MountIndex did not return any ids')
		}
		const firstMount = mounts[0]
		if (
			!firstMount ||
			typeof firstMount !== 'object' ||
			!('id' in firstMount)
		) {
			throw new Error('MountIndex did not return any ids')
		}
		const firstMountId = firstMount.id
		if (typeof firstMountId !== 'number' || !firstMountId) {
			throw new Error('MountIndex did not return any ids')
		}
		mountId = firstMountId

		const { failures: mountSearchFailures } = await runEndpoint({
			name: 'wow-game-data-mount-search',
			inputs: [null],
			call: async () => client.wow.MountSearch(new URLSearchParams()),
			saveId: () => 'root',
		})
		searchFailures = mountSearchFailures
	})

	it('validates mount index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates mount endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-mount',
			inputs: [mountId],
			call: async (id) => client.wow.Mount(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates mount search endpoint', () => {
		expect(searchFailures).toHaveLength(0)
	})
})
