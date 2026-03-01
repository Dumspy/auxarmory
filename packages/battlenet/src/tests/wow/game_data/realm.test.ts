import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data realm', () => {
	const client = createApplicationClient()
	let realmSlug: string
	let indexFailures: unknown[]
	let searchFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-realm-index',
			inputs: [null],
			call: async () => client.wow.RealmIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const indexResult = indexResults[0]?.output
		if (!indexResult || typeof indexResult !== 'object') {
			throw new Error('RealmIndex did not return any slugs')
		}
		const realms = 'realms' in indexResult ? indexResult.realms : null
		if (!Array.isArray(realms)) {
			throw new Error('RealmIndex did not return any slugs')
		}
		const firstRealm = realms[0]
		if (
			!firstRealm ||
			typeof firstRealm !== 'object' ||
			!('slug' in firstRealm)
		) {
			throw new Error('RealmIndex did not return any slugs')
		}
		const firstRealmSlug = firstRealm.slug
		if (typeof firstRealmSlug !== 'string' || !firstRealmSlug) {
			throw new Error('RealmIndex did not return any slugs')
		}
		realmSlug = firstRealmSlug

		const { failures: realmSearchFailures } = await runEndpoint({
			name: 'wow-game-data-realm-search',
			inputs: [null],
			call: async () => client.wow.RealmSearch(new URLSearchParams()),
			saveId: () => 'root',
		})
		searchFailures = realmSearchFailures
	})

	it('validates realm index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates realm endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-realm',
			inputs: [realmSlug],
			call: async (slug) => client.wow.Realm(slug),
			saveId: (slug) => slug,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates realm search endpoint', () => {
		expect(searchFailures).toHaveLength(0)
	})
})
