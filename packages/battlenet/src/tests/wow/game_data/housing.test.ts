import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

function getFirstId(
	output: unknown,
	field: 'decor_items' | 'fixtures' | 'fixture_hooks' | 'rooms',
) {
	if (!output || typeof output !== 'object') {
		throw new Error('Index did not return any ids')
	}
	const entries =
		field in output ? (output as Record<string, unknown>)[field] : null
	if (!Array.isArray(entries)) {
		throw new Error('Index did not return any ids')
	}
	const firstEntry = entries.find(
		(entry) => entry && typeof entry === 'object' && 'id' in entry,
	) as { id?: unknown } | undefined
	if (!firstEntry) {
		throw new Error('Index did not return any ids')
	}
	const id = firstEntry.id
	if (typeof id !== 'number' && typeof id !== 'string') {
		throw new Error('Index did not return any ids')
	}
	return id
}

describe('battlenet wow game data housing', () => {
	const client = createApplicationClient()
	let decorId: number | string
	let fixtureId: number | string
	let fixtureHookId: number | string
	let roomId: number
	let decorIndexFailures: unknown[]
	let decorSearchFailures: unknown[]
	let fixtureIndexFailures: unknown[]
	let fixtureSearchFailures: unknown[]
	let fixtureHookIndexFailures: unknown[]
	let fixtureHookSearchFailures: unknown[]
	let roomIndexFailures: unknown[]
	let roomSearchFailures: unknown[]

	beforeAll(async () => {
		const { results: decorIndexResults, failures: decorFailures } =
			await runEndpoint({
				name: 'wow-game-data-housing-decor-index',
				inputs: [null],
				call: async () => client.wow.HousingDecorIndex(),
				saveId: () => 'root',
			})
		decorIndexFailures = decorFailures
		decorId = getFirstId(decorIndexResults[0]?.output, 'decor_items')

		const { failures: decorSearchResultFailures } = await runEndpoint({
			name: 'wow-game-data-housing-decor-search',
			inputs: [null],
			call: async () =>
				client.wow.HousingDecorSearch(new URLSearchParams()),
			saveId: () => 'root',
		})
		decorSearchFailures = decorSearchResultFailures

		const { results: fixtureIndexResults, failures: fixtureFailures } =
			await runEndpoint({
				name: 'wow-game-data-housing-fixture-index',
				inputs: [null],
				call: async () => client.wow.HousingFixtureIndex(),
				saveId: () => 'root',
			})
		fixtureIndexFailures = fixtureFailures
		fixtureId = getFirstId(fixtureIndexResults[0]?.output, 'fixtures')

		const { failures: fixtureSearchResultFailures } = await runEndpoint({
			name: 'wow-game-data-housing-fixture-search',
			inputs: [null],
			call: async () =>
				client.wow.HousingFixtureSearch(new URLSearchParams()),
			saveId: () => 'root',
		})
		fixtureSearchFailures = fixtureSearchResultFailures

		const { results: hookIndexResults, failures: hookFailures } =
			await runEndpoint({
				name: 'wow-game-data-housing-fixture-hook-index',
				inputs: [null],
				call: async () => client.wow.HousingFixtureHookIndex(),
				saveId: () => 'root',
			})
		fixtureHookIndexFailures = hookFailures
		fixtureHookId = getFirstId(hookIndexResults[0]?.output, 'fixture_hooks')

		const { failures: hookSearchResultFailures } = await runEndpoint({
			name: 'wow-game-data-housing-fixture-hook-search',
			inputs: [null],
			call: async () =>
				client.wow.HousingFixtureHookSearch(new URLSearchParams()),
			saveId: () => 'root',
		})
		fixtureHookSearchFailures = hookSearchResultFailures

		const { results: roomIndexResults, failures: roomFailures } =
			await runEndpoint({
				name: 'wow-game-data-housing-room-index',
				inputs: [null],
				call: async () => client.wow.HousingRoomIndex(),
				saveId: () => 'root',
			})
		roomIndexFailures = roomFailures
		const resolvedRoomId = getFirstId(roomIndexResults[0]?.output, 'rooms')
		if (typeof resolvedRoomId !== 'number') {
			throw new Error('HousingRoomIndex did not return numeric ids')
		}
		roomId = resolvedRoomId

		const { failures: roomSearchResultFailures } = await runEndpoint({
			name: 'wow-game-data-housing-room-search',
			inputs: [null],
			call: async () =>
				client.wow.HousingRoomSearch(new URLSearchParams()),
			saveId: () => 'root',
		})
		roomSearchFailures = roomSearchResultFailures
	})

	it('validates housing decor index endpoint', () => {
		expect(decorIndexFailures).toHaveLength(0)
	})

	it('validates housing decor endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-housing-decor',
			inputs: [decorId],
			call: async (id) => client.wow.HousingDecor(id),
			saveId: (id) => String(id),
		})
		expect(failures).toHaveLength(0)
	})

	it('validates housing decor search endpoint', () => {
		expect(decorSearchFailures).toHaveLength(0)
	})

	it('validates housing fixture index endpoint', () => {
		expect(fixtureIndexFailures).toHaveLength(0)
	})

	it('validates housing fixture endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-housing-fixture',
			inputs: [fixtureId],
			call: async (id) => client.wow.HousingFixture(id),
			saveId: (id) => String(id),
		})
		expect(failures).toHaveLength(0)
	})

	it('validates housing fixture search endpoint', () => {
		expect(fixtureSearchFailures).toHaveLength(0)
	})

	it('validates housing fixture hook index endpoint', () => {
		expect(fixtureHookIndexFailures).toHaveLength(0)
	})

	it('validates housing fixture hook endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-housing-fixture-hook',
			inputs: [fixtureHookId],
			call: async (id) => client.wow.HousingFixtureHook(id),
			saveId: (id) => String(id),
		})
		expect(failures).toHaveLength(0)
	})

	it('validates housing fixture hook search endpoint', () => {
		expect(fixtureHookSearchFailures).toHaveLength(0)
	})

	it('validates housing room index endpoint', () => {
		expect(roomIndexFailures).toHaveLength(0)
	})

	it('validates housing room endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-housing-room',
			inputs: [roomId],
			call: async (id) => client.wow.HousingRoom(id),
			saveId: (id) => String(id),
		})
		expect(failures).toHaveLength(0)
	})

	it('validates housing room search endpoint', () => {
		expect(roomSearchFailures).toHaveLength(0)
	})
})
