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

export const ProfessionIndexResponse = LinkSelfResponse.extend({
	professions: z.array(KeyNameIdResponse),
});
export function ProfessionIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof ProfessionIndexResponse>>({
		endpoint: `data/wow/profession/index`,
		namespace: "static",
		zod: ProfessionIndexResponse,
	});
}

export const ProfessionResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	description: LocaleResponse.optional(),
	type: z.strictObject({
		type: z.enum(["PRIMARY", "SECONDARY"]),
		name: LocaleResponse,
	}),
	media: MediaKeyResponse,
	skill_tiers: z.array(KeyNameIdResponse).optional(),
	minimum_skill_level: z.number().optional(),
	maximum_skill_level: z.number().optional(),
});
export function Profession(this: WoWGameDataClient, professionId: number) {
	return this.request<z.infer<typeof ProfessionResponse>>({
		endpoint: `data/wow/profession/${professionId}`,
		namespace: "static",
		zod: ProfessionResponse,
	});
}

export const ProfessionMediaResponse = LinkSelfResponse.extend({
	assets: MediaAssetArray,
	id: z.number(),
});
export function ProfessionMedia(this: WoWGameDataClient, professionId: number) {
	return this.request<z.infer<typeof ProfessionMediaResponse>>({
		endpoint: `data/wow/media/profession/${professionId}`,
		namespace: "static",
		zod: ProfessionMediaResponse,
	});
}

export const ProfessionSkillTierResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	minimum_skill_level: z.number(),
	maximum_skill_level: z.number(),
	categories: z
		.array(
			z.strictObject({
				name: LocaleResponse,
				recipes: z.array(KeyNameIdResponse),
			}),
		)
		.optional(),
});
export function ProfessionSkillTier(
	this: WoWGameDataClient,
	professionId: number,
	skillTierId: number,
) {
	return this.request<z.infer<typeof ProfessionSkillTierResponse>>({
		endpoint: `data/wow/profession/${professionId}/skill-tier/${skillTierId}`,
		namespace: "static",
		zod: ProfessionSkillTierResponse,
	});
}

export const ProfessionRecipeResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	description: LocaleResponse.optional(),
	media: MediaKeyResponse,
	crafted_item: KeyNameIdResponse.optional(),
	alliance_crafted_item: KeyNameIdResponse.optional(),
	horde_crafted_item: KeyNameIdResponse.optional(),
	modified_crafting_slots: z
		.array(
			z.strictObject({
				slot_type: z.union([KeyIdResponse, KeyNameIdResponse]),
				display_order: z.number(),
			}),
		)
		.optional(),
	reagents: z
		.array(
			z.strictObject({
				reagent: KeyNameIdResponse,
				quantity: z.number(),
			}),
		)
		.optional(),
	rank: z.number().optional(),
	crafted_quantity: z
		.union([
			z.strictObject({
				value: z.number(),
			}),
			z.strictObject({
				minimum: z.number(),
				maximum: z.number(),
			}),
		])
		.optional(),
});
export function ProfessionRecipe(this: WoWGameDataClient, recipeId: number) {
	return this.request<z.infer<typeof ProfessionRecipeResponse>>({
		endpoint: `data/wow/recipe/${recipeId}`,
		namespace: "static",
		zod: ProfessionRecipeResponse,
	});
}

export const ProfessionRecipeMediaResponse = LinkSelfResponse.extend({
	assets: MediaAssetArray,
	id: z.number(),
});
export function ProfessionRecipeMedia(
	this: WoWGameDataClient,
	recipeId: number,
) {
	return this.request<z.infer<typeof ProfessionRecipeMediaResponse>>({
		endpoint: `data/wow/media/recipe/${recipeId}`,
		namespace: "static",
		zod: ProfessionRecipeMediaResponse,
	});
}
