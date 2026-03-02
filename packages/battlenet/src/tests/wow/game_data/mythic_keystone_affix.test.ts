import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data mythic keystone affix', () => {
	const client = createApplicationClient()
	let affixId: number
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-mythic-keystone-affix-index',
			inputs: [null],
			call: async () => client.wow.MythicKeystoneAffixesIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const indexResult = indexResults[0]?.output
		if (!indexResult || typeof indexResult !== 'object') {
			throw new Error('MythicKeystoneAffixesIndex did not return any ids')
		}
		const affixes = 'affixes' in indexResult ? indexResult.affixes : null
		if (!Array.isArray(affixes)) {
			throw new Error('MythicKeystoneAffixesIndex did not return any ids')
		}
		const firstAffix = affixes[0]
		if (
			!firstAffix ||
			typeof firstAffix !== 'object' ||
			!('id' in firstAffix)
		) {
			throw new Error('MythicKeystoneAffixesIndex did not return any ids')
		}
		const firstAffixId = firstAffix.id
		if (typeof firstAffixId !== 'number' || !firstAffixId) {
			throw new Error('MythicKeystoneAffixesIndex did not return any ids')
		}
		affixId = firstAffixId
	})

	it('validates mythic keystone affix index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates mythic keystone affix endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-mythic-keystone-affix',
			inputs: [affixId],
			call: async (id) => client.wow.MythicKeystoneAffix(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates mythic keystone affix media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-mythic-keystone-affix-media',
			inputs: [affixId],
			call: async (id) => client.wow.MythicKeystoneAffixMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
