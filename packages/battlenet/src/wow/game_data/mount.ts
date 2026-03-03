import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyIdResponse,
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../validators'
import { Faction } from '../types'

export const MountIndexResponse = LinkSelfResponse.extend({
	mounts: z.array(KeyNameIdResponse),
})
export function MountIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof MountIndexResponse>>({
		endpoint: `data/wow/mount/index`,
		namespace: 'static',
		zod: MountIndexResponse,
	})
}

export const MountResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	creature_displays: z.array(KeyIdResponse),
	description: LocaleResponse,
	source: z
		.object({
			type: z.enum([
				'VENDOR',
				'PROFESSION',
				'QUEST',
				'DROP',
				'ACHIEVEMENT',
				'TCG',
				'WORLDEVENT',
				'PROMOTION',
				'TRADINGPOST',
				'PETSTORE',
				'DISCOVERY',
			]),
			name: LocaleResponse,
		})
		.optional(),
	faction: Faction.optional(),
	requirements: z
		.object({
			faction: Faction.optional(),
			classes: z.array(KeyNameIdResponse).optional(),
		})
		.optional(),
	should_exclude_if_uncollected: z.boolean().optional(),
})
export function Mount(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof MountResponse>>({
		endpoint: `data/wow/mount/${id}`,
		namespace: 'static',
		zod: MountResponse,
	})
}

export const MountSearchResponse = z.unknown()
export function MountSearch(this: WoWGameDataClient, params: URLSearchParams) {
	return this.request<z.infer<typeof MountSearchResponse>>({
		endpoint: `data/wow/search/mount`,
		namespace: 'static',
		zod: MountSearchResponse,
		params,
	})
}
