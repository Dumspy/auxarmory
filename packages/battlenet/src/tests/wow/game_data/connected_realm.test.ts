import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { extractNumericId, runEndpoint } from '../../harness'

describe('battlenet wow game data connected realm', () => {
	const client = createApplicationClient()
	let realmId: number
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-connected-realm-index',
			inputs: [null],
			call: async () => client.wow.ConnectedRealmIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const firstRealmHref =
			indexResults[0]?.output?.connected_realms?.[0]?.href
		const extractedRealmId = extractNumericId(firstRealmHref)
		if (!extractedRealmId) {
			throw new Error('ConnectedRealmIndex did not return any realm ids')
		}
		realmId = extractedRealmId
	})

	it('validates connected realm index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates connected realm endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-connected-realm',
			inputs: [realmId],
			call: async (id) => client.wow.ConnectedRealm(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
