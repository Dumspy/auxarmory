import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaAssetArray,
} from '../../types'

export const AzeriteIndexResponse = LinkSelfResponse.extend({
	azerite_essences: z.array(KeyNameIdResponse),
})
export function AzeriteIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof AzeriteIndexResponse>>({
		endpoint: `data/wow/azerite-essence/index`,
		namespace: 'static',
		zod: AzeriteIndexResponse,
	})
}

export const AzeriteResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	allowed_specializations: z.array(KeyNameIdResponse),
	powers: z.array(
		z.strictObject({
			id: z.number(),
			rank: z.number(),
			main_power_spell: KeyNameIdResponse,
			passive_power_spell: KeyNameIdResponse,
		}),
	),
	media: z.strictObject({
		key: KeyResponse,
		id: z.number(),
	}),
})
// NOTE: Suspect that the docs is actually wrong and the id here should be an integer.
// But we are following their docs for now.
export function Azerite(this: WoWGameDataClient, essenceId: string) {
	return this.request<z.infer<typeof AzeriteResponse>>({
		endpoint: `data/wow/azerite-essence/${essenceId}`,
		namespace: 'static',
		zod: AzeriteResponse,
	})
}

export function AzeriteSearch(
	this: WoWGameDataClient,
	_specilizationId?: number,
	_page = 1,
) {
	// TODO: do order by properly
	return this.request<unknown>({
		endpoint: `data/wow/search/azerite-essence`,
		namespace: 'static',
		zod: z.unknown(),
	})
}

export const AzeriteMediaResponse = LinkSelfResponse.extend({
	id: z.number(),
	assets: MediaAssetArray,
})
export function AzeriteMedia(this: WoWGameDataClient, essenceId: number) {
	return this.request<z.infer<typeof AzeriteMediaResponse>>({
		endpoint: `data/wow/media/azerite-essence/${essenceId}`,
		namespace: 'static',
		zod: AzeriteMediaResponse,
	})
}
