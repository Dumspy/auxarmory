import { describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

const raid = 'nerubar-palace'

describe('battlenet wow game data mythic raid leaderboard', () => {
	it('validates mythic raid leaderboard endpoint', async () => {
		const client = createApplicationClient()

		const { failures } = await runEndpoint({
			name: 'wow-game-data-mythic-raid-leaderboard',
			inputs: [{ raid, faction: 'horde' }],
			call: async ({ raid }) =>
				client.wow.MythicRaidLeaderboard(raid, 'horde'),
			saveId: ({ raid, faction }) => `${raid}-${faction}`,
		})
		expect(failures).toHaveLength(0)
	})
})
