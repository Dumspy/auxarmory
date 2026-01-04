import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import {
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaAssetArray,
	MediaKeyResponse,
} from "../../types";

export const PvPBracketType = z.enum([
	"ARENA_2v2",
	"ARENA_3v3",
	"BATTLEGROUNDS",
	"SHUFFLE",
	"BLITZ",
]);

export const PvPTierIndexResponse = LinkSelfResponse.extend({
	tiers: z.array(KeyNameIdResponse),
});
export function PvPTierIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof PvPTierIndexResponse>>({
		endpoint: `data/wow/pvp-tier/index`,
		namespace: "static",
		zod: PvPTierIndexResponse,
	});
}

export const PvPTierResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	min_rating: z.number(),
	max_rating: z.number(),
	media: MediaKeyResponse,
	bracket: z.strictObject({
		id: z.number(),
		type: PvPBracketType,
	}),
	rating_type: z.number(),
});
export function PvPTier(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof PvPTierResponse>>({
		endpoint: `data/wow/pvp-tier/${id}`,
		namespace: "static",
		zod: PvPTierResponse,
	});
}

export const PvPTierMediaResponse = LinkSelfResponse.extend({
	assets: MediaAssetArray,
	id: z.number(),
});
export function PvPTierMedia(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof PvPTierMediaResponse>>({
		endpoint: `data/wow/media/pvp-tier/${id}`,
		namespace: "static",
		zod: PvPTierMediaResponse,
	});
}
