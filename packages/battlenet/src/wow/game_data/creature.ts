import { z } from 'zod/v4';

import type { WoWGameDataClient } from '..';
import {
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaAssetArray,
	MediaKeyResponse,
} from '../../types';

export const CreatureResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	type: KeyNameIdResponse,
	family: KeyNameIdResponse.optional(),
	creature_displays: z.array(
		z.strictObject({ key: KeyResponse, id: z.number() }),
	),
	is_tameable: z.boolean(),
});
export function Creature(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof CreatureResponse>>({
		endpoint: `data/wow/creature/${id}`,
		namespace: 'static',
		zod: CreatureResponse,
	});
}

export function CreatureSearch(
	this: WoWGameDataClient,
	params: URLSearchParams,
) {
	return this.request<unknown>({
		endpoint: `data/wow/search/creature`,
		namespace: 'static',
		zod: z.unknown(),
		params,
	});
}

export const CreatureMediaResponse = LinkSelfResponse.extend({
	id: z.number(),
	assets: MediaAssetArray,
});
export function CreatureMedia(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof CreatureMediaResponse>>({
		endpoint: `data/wow/media/creature-display/${id}`,
		namespace: 'static',
		zod: CreatureMediaResponse,
	});
}

export const CreatureFamilyIndexResponse = LinkSelfResponse.extend({
	creature_families: z.array(KeyNameIdResponse),
});
export function CreatureFamilyIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof CreatureFamilyIndexResponse>>({
		endpoint: `data/wow/creature-family/index`,
		namespace: 'static',
		zod: CreatureFamilyIndexResponse,
	});
}

export const CreatureFamilyResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	specialization: KeyNameIdResponse.optional(),
	media: MediaKeyResponse.optional(),
});
export function CreatureFamily(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof CreatureFamilyResponse>>({
		endpoint: `data/wow/creature-family/${id}`,
		namespace: 'static',
		zod: CreatureFamilyResponse,
	});
}

export const CreatureFamilyMediaResponse = LinkSelfResponse.extend({
	id: z.number(),
	assets: MediaAssetArray,
});
export function CreatureFamilyMedia(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof CreatureFamilyMediaResponse>>({
		endpoint: `data/wow/media/creature-family/${id}`,
		namespace: 'static',
		zod: CreatureFamilyMediaResponse,
	});
}

export const CreatureTypeIndexResponse = LinkSelfResponse.extend({
	creature_types: z.array(KeyNameIdResponse),
});
export function CreatureTypeIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof CreatureTypeIndexResponse>>({
		endpoint: `data/wow/creature-type/index`,
		namespace: 'static',
		zod: CreatureTypeIndexResponse,
	});
}

export const CreatureTypeResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
});
export function CreatureType(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof CreatureTypeResponse>>({
		endpoint: `data/wow/creature-type/${id}`,
		namespace: 'static',
		zod: CreatureTypeResponse,
	});
}
