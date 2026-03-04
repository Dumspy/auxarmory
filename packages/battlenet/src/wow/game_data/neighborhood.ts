import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types'

export const NeighborhoodMapIndexResponse = LinkSelfResponse.extend({
	maps: z.array(KeyNameIdResponse),
})
export function NeighborhoodMapIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof NeighborhoodMapIndexResponse>>({
		endpoint: `data/wow/neighborhood-map/index`,
		namespace: 'dynamic',
		zod: NeighborhoodMapIndexResponse,
	})
}

export const NeighborhoodMapResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse.optional(),
	neighborhoods: z.array(KeyNameIdResponse).optional(),
})
export function NeighborhoodMap(
	this: WoWGameDataClient,
	neighborhoodMapId: number,
) {
	return this.request<z.infer<typeof NeighborhoodMapResponse>>({
		endpoint: `data/wow/neighborhood-map/${neighborhoodMapId}`,
		namespace: 'dynamic',
		zod: NeighborhoodMapResponse,
	})
}

export const NeighborhoodResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse.optional(),
	neighborhood_map: KeyNameIdResponse.optional(),
	rooms: z.array(KeyNameIdResponse).optional(),
})
export function Neighborhood(
	this: WoWGameDataClient,
	neighborhoodMapId: number,
	neighborhoodId: number,
) {
	return this.request<z.infer<typeof NeighborhoodResponse>>({
		endpoint: `data/wow/neighborhood-map/${neighborhoodMapId}/neighborhood/${neighborhoodId}`,
		namespace: 'dynamic',
		zod: NeighborhoodResponse,
	})
}
