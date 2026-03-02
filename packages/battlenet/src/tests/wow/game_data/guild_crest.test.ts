import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data guild crest', () => {
	const client = createApplicationClient()
	let emblemId: number | null
	let borderId: number | null
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-guild-crest-index',
			inputs: [null],
			call: async () => client.wow.GuildCrestIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		emblemId = indexResults[0]?.output?.emblems?.[0]?.id ?? null
		borderId = indexResults[0]?.output?.borders?.[0]?.id ?? null
	})

	it('validates guild crest index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates guild crest emblem media endpoint', async () => {
		if (!emblemId) return
		const { failures } = await runEndpoint({
			name: 'wow-game-data-guild-crest-emblem-media',
			inputs: [emblemId],
			call: async (id) => client.wow.GuildCrestsEmblemMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates guild crest border media endpoint', async () => {
		if (!borderId) return
		const { failures } = await runEndpoint({
			name: 'wow-game-data-guild-crest-border-media',
			inputs: [borderId],
			call: async (id) => client.wow.GuildCrestBorderMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
