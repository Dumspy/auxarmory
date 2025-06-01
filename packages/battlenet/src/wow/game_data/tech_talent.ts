import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import {
	KeyIdResponse,
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaAssetArray,
	MediaKeyResponse,
} from "../../types";
import { SpellTooltips } from "../types";

export const TechTalentTreeIndexResponse = LinkSelfResponse.extend({
	talent_trees: z.array(z.union([KeyIdResponse, KeyNameIdResponse])),
});
export function TechTalentTreeIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof TechTalentTreeIndexResponse>>({
		endpoint: `data/wow/tech-talent-tree/index`,
		namespace: "static",
		zod: TechTalentTreeIndexResponse,
	});
}

export const TechTalentTreeResponse = LinkSelfResponse.extend({
	id: z.number(),
	playable_class: KeyNameIdResponse.optional(),
	max_tiers: z.number(),
	talents: z.array(KeyNameIdResponse),
});
export function TechTalentTree(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof TechTalentTreeResponse>>({
		endpoint: `data/wow/tech-talent-tree/${id}`,
		namespace: "static",
		zod: TechTalentTreeResponse,
	});
}

export const TechTalentIndexResponse = LinkSelfResponse.extend({
	talents: z.array(KeyNameIdResponse),
});
export function TechTalentIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof TechTalentIndexResponse>>({
		endpoint: `data/wow/tech-talent/index`,
		namespace: "static",
		zod: TechTalentIndexResponse,
	});
}

export const TechTalentResponse = LinkSelfResponse.extend({
	id: z.number(),
	talent_tree: z.union([KeyIdResponse, KeyNameIdResponse]),
	name: LocaleResponse,
	description: LocaleResponse.optional(),
	spell_tooltip: SpellTooltips.optional(),
	prerequisite_talent: KeyNameIdResponse.optional(),
	socket_type: z
		.strictObject({
			type: z.enum(["POTENCY", "ENDURANCE", "FINESSE"]),
			name: LocaleResponse,
		})
		.optional(),
	tier: z.number(),
	display_order: z.number(),
	media: MediaKeyResponse,
});
export function TechTalent(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/tech-talent/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export const TechTalentMediaResponse = LinkSelfResponse.extend({
	assets: MediaAssetArray,
});
export function TechTalentMedia(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof TechTalentMediaResponse>>({
		endpoint: `data/wow/media/tech-talent/${id}`,
		namespace: "static",
		zod: TechTalentMediaResponse,
	});
}
