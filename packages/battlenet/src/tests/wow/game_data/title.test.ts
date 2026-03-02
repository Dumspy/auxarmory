import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data title', () => {
	const client = createApplicationClient()
	let titleId: number
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-title-index',
			inputs: [null],
			call: async () => client.wow.TitleIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const indexResult = indexResults[0]?.output
		if (!indexResult || typeof indexResult !== 'object') {
			throw new Error('TitleIndex did not return any ids')
		}
		const titles = 'titles' in indexResult ? indexResult.titles : null
		if (!Array.isArray(titles)) {
			throw new Error('TitleIndex did not return any ids')
		}
		const firstTitle = titles[0]
		if (
			!firstTitle ||
			typeof firstTitle !== 'object' ||
			!('id' in firstTitle)
		) {
			throw new Error('TitleIndex did not return any ids')
		}
		const firstTitleId = firstTitle.id
		if (typeof firstTitleId !== 'number' || !firstTitleId) {
			throw new Error('TitleIndex did not return any ids')
		}
		titleId = firstTitleId
	})

	it('validates title index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates title endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-title',
			inputs: [titleId],
			call: async (id) => client.wow.Title(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
