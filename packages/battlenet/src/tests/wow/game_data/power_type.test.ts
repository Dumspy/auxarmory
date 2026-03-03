import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data power type', () => {
	const client = createApplicationClient()
	let powerTypeId: number
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-power-type-index',
			inputs: [null],
			call: async () => client.wow.PowerTypeIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const indexResult = indexResults[0]?.output
		if (!indexResult || typeof indexResult !== 'object') {
			throw new Error('PowerTypeIndex did not return any ids')
		}
		const powerTypes =
			'power_types' in indexResult ? indexResult.power_types : null
		if (!Array.isArray(powerTypes)) {
			throw new Error('PowerTypeIndex did not return any ids')
		}
		const firstPowerType = powerTypes[0]
		if (
			!firstPowerType ||
			typeof firstPowerType !== 'object' ||
			!('id' in firstPowerType)
		) {
			throw new Error('PowerTypeIndex did not return any ids')
		}
		const firstPowerTypeId = firstPowerType.id
		if (typeof firstPowerTypeId !== 'number' || !firstPowerTypeId) {
			throw new Error('PowerTypeIndex did not return any ids')
		}
		powerTypeId = firstPowerTypeId
	})

	it('validates power type index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates power type endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-power-type',
			inputs: [powerTypeId],
			call: async (id) => client.wow.PowerType(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
