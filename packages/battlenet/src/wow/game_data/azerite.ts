import { z } from "zod/v4";
import { WoWGameDataClient } from "..";
import {
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaAssetArray,
} from "../../types";

export const AzeriteIndexResponse = LinkSelfResponse.extend({
	azerite_essences: z.array(KeyNameIdResponse),
})
export function AzeriteIndex(
	this: WoWGameDataClient,
): Promise<z.infer<typeof AzeriteIndexResponse>> {
	return this.request({
		endpoint: `data/wow/azerite-essence/index`,
		namespace: "static",
	});
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
export function Azerite(this: WoWGameDataClient, essenceId: string): Promise<z.infer<typeof AzeriteResponse>> {
	return this.request({
		endpoint: `data/wow/azerite-essence/${essenceId}`,
		namespace: "static",
	});
}

export function AzeriteSearch(
	this: WoWGameDataClient,
	specilizationId?: number,
	page: number = 1,
) {
	// TODO: do order by properly
	return this.request({
		endpoint: `data/wow/search/azerite-essence`,
		namespace: "static",
	});
}

export const AzeriteMediaResponse = LinkSelfResponse.extend({
	id: z.number(),
	assets: MediaAssetArray,
})
export function AzeriteMedia(this: WoWGameDataClient, essenceId: number): Promise<z.infer<typeof AzeriteMediaResponse>> {
	return this.request({
		endpoint: `data/wow/media/azerite-essence/${essenceId}`,
		namespace: "static",
	});
}
