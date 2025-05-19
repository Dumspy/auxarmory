import z from "zod";
import { WoWClient } from "..";
import {
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
} from "../../types";
import { Faction } from "../types";

// TODO: Return types

export const AchievementIndexResponse = LinkSelfResponse.extend({
	achievements: z.array(KeyNameIdResponse),
});

export function AchievementsIndex(
	this: WoWClient,
): Promise<z.infer<typeof AchievementIndexResponse>> {
	return this.request({
		endpoint: "data/wow/achievement/index",
		namespace: "static",
	});
}

export const AchievementResponse = LinkSelfResponse.extend({
	id: z.number(),
	category: KeyNameIdResponse,
	name: LocaleResponse,
	description: LocaleResponse,
	points: z.number(),
	is_account_wide: z.boolean(),
	criteria: z
		.object({
			id: z.number(),
			description: LocaleResponse,
			amount: z.number(),
			operator: z
				.object({
					type: z.enum(["COMPLETE_AT_LEAST", "AND"]),
					name: LocaleResponse,
				})
				.optional(),
			child_criteria: z
				.array(
					z.object({
						id: z.number(),
						description: LocaleResponse,
						amount: z.number(),
						faction: Faction.optional(),
					}),
				)
				.optional(),
		})
		.optional(),
	media: z.object({
		key: KeyResponse,
		id: z.number(),
	}),
	display_order: z.number(),
	requirements: z
		.object({
			faction: Faction,
		})
		.optional(),
	prerequisite_achievement: KeyNameIdResponse.optional(),
	next_achievement: KeyNameIdResponse.optional(),
});

export function Achievement(
	this: WoWClient,
	id: number,
): Promise<z.infer<typeof AchievementResponse>> {
	return this.request({
		endpoint: `data/wow/achievement/${id}`,
		namespace: "static",
	});
}

export const AchievementMediaResponse = LinkSelfResponse.extend({
	id: z.number(),
	assets: z.array(
		z.object({
			key: z.enum(["icon"]),
			value: z.string(),
			file_data_id: z.number(),
		}),
	),
});

export function AchievementMedia(
	this: WoWClient,
	id: number,
): Promise<z.infer<typeof AchievementMediaResponse>> {
	return this.request({
		endpoint: `data/wow/media/achievement/${id}`,
		namespace: "static",
	});
}

export const AchievementCategoryIndexResponse = LinkSelfResponse.extend({
	categories: z.array(KeyNameIdResponse),
	root_categories: z.array(KeyNameIdResponse),
	guild_categories: z.array(KeyNameIdResponse),
});

export function AchievementCategoryIndex(
	this: WoWClient,
): Promise<z.infer<typeof AchievementCategoryIndexResponse>> {
	return this.request({
		endpoint: "data/wow/achievement-category/index",
		namespace: "static",
	});
}

export const AchievementCategoryResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	achievements: z.array(KeyNameIdResponse).optional(),
	parent_category: KeyNameIdResponse.optional(),
	subcategories: z.array(KeyNameIdResponse).optional(),
	is_guild_category: z.boolean(),
	aggregates_by_faction: z.object({
		horde: z.object({
			quantity: z.number(),
			points: z.number(),
		}),
		alliance: z.object({
			quantity: z.number(),
			points: z.number(),
		}),
	}),
	display_order: z.number(),
});

export function AchievementCategory(
	this: WoWClient,
	id: number,
): Promise<z.infer<typeof AchievementCategoryResponse>> {
	return this.request({
		endpoint: `data/wow/achievement-category/${id}`,
		namespace: "static",
	});
}
