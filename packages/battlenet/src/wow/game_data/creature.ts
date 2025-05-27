import { z } from "zod/v4";
import { WoWGameDataClient } from "..";
import {
	LinkSelfResponse,
	KeyNameIdResponse,
	LocaleResponse,
	MediaKeyResponse,
	MediaAssetArray,
	KeyResponse,
} from "../../types";

export const CreatureResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	type: KeyNameIdResponse,
	family: KeyNameIdResponse.optional(),
	creature_displays: z.array(z.strictObject({ key: KeyResponse, id: z.number() })),
	is_tameable: z.boolean(),
})
export function Creature(this: WoWGameDataClient, id: number): Promise<z.infer<typeof CreatureResponse>> {
	return this.request({
		endpoint: `data/wow/creature/${id}`,
		namespace: "static",
	});
}

export function CreatureSearch(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/search/creature`,
		namespace: "static",
	});
}

export const CreatureMediaResponse = LinkSelfResponse.extend({
	id: z.number(),
	assets: MediaAssetArray,
})
export function CreatureMedia(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/creature-display/${id}`,
		namespace: "static",
	});
}

export const CreatueFamilyIndexResponse = LinkSelfResponse.extend({
	creature_families: z.array(KeyNameIdResponse),
})
export function CreatueFamilyIndex(
	this: WoWGameDataClient,
): Promise<z.infer<typeof CreatueFamilyIndexResponse>> {
	return this.request({
		endpoint: `data/wow/creature-family/index`,
		namespace: "static",
	});
}

export const CreatueFamilyResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	specialization: KeyNameIdResponse.optional(),
	media: MediaKeyResponse.optional(),
})
export function CreatueFamily(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/creature-family/${id}`,
		namespace: "static",
	});
}

export const CreatueFamilyMediaResponse = LinkSelfResponse.extend({
	id: z.number(),
	assets: MediaAssetArray,
})
export function CreatueFamilyMedia(
	this: WoWGameDataClient,
	id: number,
): Promise<z.infer<typeof CreatueFamilyMediaResponse>> {
	return this.request({
		endpoint: `data/wow/media/creature-family/${id}`,
		namespace: "static",
	});
}

export const CreatureTypeIndexResponse = LinkSelfResponse.extend({
	creature_types: z.array(KeyNameIdResponse),
})
export function CreatureTypeIndex(
	this: WoWGameDataClient,
): Promise<z.infer<typeof CreatureTypeIndexResponse>> {
	return this.request({
		endpoint: `data/wow/creature-type/index`,
		namespace: "static",
	});
}

export const CreatureTypeResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
})
export function CreatureType(
	this: WoWGameDataClient,
	id: number,
): Promise<z.infer<typeof CreatureTypeResponse>> {
	return this.request({
		endpoint: `data/wow/creature-type/${id}`,
		namespace: "static",
	});
}
