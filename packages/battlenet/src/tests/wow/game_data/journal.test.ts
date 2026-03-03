import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data journal', () => {
	const client = createApplicationClient()
	let expansionId: number
	let encounterId: number
	let instanceId: number
	let expansionIndexFailures: unknown[]
	let encounterIndexFailures: unknown[]
	let instanceIndexFailures: unknown[]
	let encounterSearchFailures: unknown[]

	beforeAll(async () => {
		const { results: expansionIndexResults, failures } = await runEndpoint({
			name: 'wow-game-data-journal-expansion-index',
			inputs: [null],
			call: async () => client.wow.JournalExpansionsIndex(),
			saveId: () => 'root',
		})
		expansionIndexFailures = failures

		const firstExpansion =
			expansionIndexResults[0]?.output?.tiers?.[0] ?? null
		if (!firstExpansion?.id) {
			throw new Error('JournalExpansionsIndex did not return any ids')
		}
		expansionId = firstExpansion.id

		const { results: encounterIndexResults, failures: encounterFailures } =
			await runEndpoint({
				name: 'wow-game-data-journal-encounter-index',
				inputs: [null],
				call: async () => client.wow.JournalEncounterIndex(),
				saveId: () => 'root',
			})
		encounterIndexFailures = encounterFailures

		const firstEncounter =
			encounterIndexResults[0]?.output?.encounters?.[0] ?? null
		if (!firstEncounter?.id) {
			throw new Error('JournalEncounterIndex did not return any ids')
		}
		encounterId = firstEncounter.id

		const { failures: journalSearchFailures } = await runEndpoint({
			name: 'wow-game-data-journal-encounter-search',
			inputs: [null],
			call: async () =>
				client.wow.JournalEncounterSearch(new URLSearchParams()),
			saveId: () => 'root',
		})
		encounterSearchFailures = journalSearchFailures

		const {
			results: instanceIndexResults,
			failures: journalInstanceFailures,
		} = await runEndpoint({
			name: 'wow-game-data-journal-instance-index',
			inputs: [null],
			call: async () => client.wow.JournalInstanceIndex(),
			saveId: () => 'root',
		})
		instanceIndexFailures = journalInstanceFailures

		const firstInstance =
			instanceIndexResults[0]?.output?.instances?.[0] ?? null
		if (!firstInstance?.id) {
			throw new Error('JournalInstanceIndex did not return any ids')
		}
		instanceId = firstInstance.id
	})

	it('validates journal expansion index endpoint', () => {
		expect(expansionIndexFailures).toHaveLength(0)
	})

	it('validates journal expansion endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-journal-expansion',
			inputs: [expansionId],
			call: async (id) => client.wow.JournalExpansions(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates journal encounter index endpoint', () => {
		expect(encounterIndexFailures).toHaveLength(0)
	})

	it('validates journal encounter endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-journal-encounter',
			inputs: [encounterId],
			call: async (id) => client.wow.JournalEncounter(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates journal encounter search endpoint', () => {
		expect(encounterSearchFailures).toHaveLength(0)
	})

	it('validates journal instance index endpoint', () => {
		expect(instanceIndexFailures).toHaveLength(0)
	})

	it('validates journal instance endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-journal-instance',
			inputs: [instanceId],
			call: async (id) => client.wow.JournalInstance(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates journal instance media endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-journal-instance-media',
			inputs: [instanceId],
			call: async (id) => client.wow.JournalInstanceMedia(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})
})
