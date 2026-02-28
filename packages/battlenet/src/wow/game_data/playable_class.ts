import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaAssetArray,
	MediaKeyResponse,
} from '../../types'

export const PlayableClassIndexResponse = LinkSelfResponse.extend({
	classes: z.array(KeyNameIdResponse),
})
export function PlayableClassIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof PlayableClassIndexResponse>>({
		endpoint: `data/wow/playable-class/index`,
		namespace: 'static',
		zod: PlayableClassIndexResponse,
	})
}

export const PlayableClassResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	gender_name: z.strictObject({
		male: LocaleResponse,
		female: LocaleResponse,
	}),
	power_type: KeyNameIdResponse,
	additional_power_types: z.array(KeyNameIdResponse).optional(),
	specializations: z.array(KeyNameIdResponse),
	media: MediaKeyResponse,
	pvp_talent_slots: KeyResponse,
	playable_races: z.array(KeyNameIdResponse),
})
export function PlayableClass(this: WoWGameDataClient, classId: number) {
	return this.request<z.infer<typeof PlayableClassResponse>>({
		endpoint: `data/wow/playable-class/${classId}`,
		namespace: 'static',
		zod: PlayableClassResponse,
	})
}

export const PlayableClassMediaResponse = LinkSelfResponse.extend({
	id: z.number(),
	assets: MediaAssetArray,
})
export function PlayableClassMedia(this: WoWGameDataClient, classId: number) {
	return this.request<z.infer<typeof PlayableClassMediaResponse>>({
		endpoint: `data/wow/media/playable-class/${classId}`,
		namespace: 'static',
		zod: PlayableClassMediaResponse,
	})
}

export const PlayablePvPTalentSlotResponse = LinkSelfResponse.extend({
	talent_slots: z.array(
		z.strictObject({
			slot_number: z.number(),
			unlock_player_level: z.number(),
		}),
	),
})
export function PlayablePvPTalentSlot(
	this: WoWGameDataClient,
	classId: number,
) {
	return this.request<z.infer<typeof PlayablePvPTalentSlotResponse>>({
		endpoint: `data/wow/playable-class/${classId}/pvp-talent-slots`,
		namespace: 'static',
		zod: PlayablePvPTalentSlotResponse,
	})
}
