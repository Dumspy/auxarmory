import { beforeAll, describe, expect, it } from 'vitest'

import { createApplicationClient } from '../../harness.clients'
import { runEndpoint } from '../../harness'

describe('battlenet wow game data neighborhood', () => {
	const client = createApplicationClient()
	let mapId: number
	let neighborhoodId: number | null
	let indexFailures: unknown[]

	beforeAll(async () => {
		const { results: indexResults, failures } = await runEndpoint({
			name: 'wow-game-data-neighborhood-map-index',
			inputs: [null],
			call: async () => client.wow.NeighborhoodMapIndex(),
			saveId: () => 'root',
		})
		indexFailures = failures

		const indexResult = indexResults[0]?.output
		if (!indexResult || typeof indexResult !== 'object') {
			throw new Error('NeighborhoodMapIndex did not return any ids')
		}
		const maps =
			'maps' in indexResult
				? (indexResult as Record<string, unknown>).maps
				: null
		if (!Array.isArray(maps)) {
			throw new Error('NeighborhoodMapIndex did not return any ids')
		}
		const firstMap = maps.find(
			(entry) => entry && typeof entry === 'object' && 'id' in entry,
		) as { id?: unknown } | undefined
		if (!firstMap) {
			throw new Error('NeighborhoodMapIndex did not return any ids')
		}
		const firstMapId = firstMap.id
		if (typeof firstMapId !== 'number') {
			throw new Error('NeighborhoodMapIndex did not return any ids')
		}
		mapId = firstMapId

		const { results: mapResults } = await runEndpoint({
			name: 'wow-game-data-neighborhood-map',
			inputs: [mapId],
			call: async (id) => client.wow.NeighborhoodMap(id),
			saveId: (id) => id,
		})
		const mapResult = mapResults[0]?.output
		if (!mapResult || typeof mapResult !== 'object') {
			throw new Error('NeighborhoodMap did not return any neighborhoods')
		}
		const neighborhoods =
			'neighborhoods' in mapResult
				? (mapResult as Record<string, unknown>).neighborhoods
				: null
		if (!Array.isArray(neighborhoods)) {
			neighborhoodId = null
			return
		}
		const firstNeighborhood = neighborhoods.find(
			(entry) => entry && typeof entry === 'object' && 'id' in entry,
		) as { id?: unknown } | undefined
		if (!firstNeighborhood) {
			neighborhoodId = null
			return
		}
		const firstNeighborhoodId = firstNeighborhood.id
		if (typeof firstNeighborhoodId !== 'number') {
			neighborhoodId = null
			return
		}
		neighborhoodId = firstNeighborhoodId
	})

	it('validates neighborhood map index endpoint', () => {
		expect(indexFailures).toHaveLength(0)
	})

	it('validates neighborhood map endpoint', async () => {
		const { failures } = await runEndpoint({
			name: 'wow-game-data-neighborhood-map',
			inputs: [mapId],
			call: async (id) => client.wow.NeighborhoodMap(id),
			saveId: (id) => id,
		})
		expect(failures).toHaveLength(0)
	})

	it('validates neighborhood endpoint', async () => {
		if (!neighborhoodId) return
		const { failures } = await runEndpoint({
			name: 'wow-game-data-neighborhood',
			inputs: [{ mapId, neighborhoodId }],
			call: async ({ mapId, neighborhoodId }) =>
				client.wow.Neighborhood(mapId, neighborhoodId),
			saveId: ({ mapId, neighborhoodId }) => `${mapId}-${neighborhoodId}`,
		})
		expect(failures).toHaveLength(0)
	})
})
