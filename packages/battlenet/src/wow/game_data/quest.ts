import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types'
import { Faction } from '../types'

export const QuestIndexResponse = LinkSelfResponse.extend({
	categories: KeyResponse,
	areas: KeyResponse,
	types: KeyResponse,
})
export function QuestIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof QuestIndexResponse>>({
		endpoint: `data/wow/quest/index`,
		namespace: 'static',
		zod: QuestIndexResponse,
	})
}

export const QuestResponse = LinkSelfResponse.extend({
	id: z.number(),
	title: LocaleResponse,
	category: KeyNameIdResponse,
	description: LocaleResponse.optional(),
	requirements: z.object({
		min_character_level: z.number(),
		max_character_level: z.number(),
		faction: Faction.optional(),
	}),
	rewards: z.object({
		experience: z.number().optional(),
		items: z
			.strictObject({
				items: z
					.array(
						z.strictObject({
							item: KeyNameIdResponse,
						}),
					)
					.optional(),
				choice_of: z
					.array(
						z.strictObject({
							item: KeyNameIdResponse,
							requirements: z
								.strictObject({
									playable_specializations:
										z.array(KeyNameIdResponse),
								})
								.optional(),
						}),
					)
					.optional(),
			})
			.optional(),
		reputations: z
			.array(
				z.strictObject({
					reward: KeyNameIdResponse,
					value: z.number(),
				}),
			)
			.optional(),
	}),
	type: KeyNameIdResponse.optional(),
	is_daily: z.boolean().optional(),
	is_weekly: z.boolean().optional(),
	is_repeatable: z.boolean().optional(),
})
export function Quest(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof QuestResponse>>({
		endpoint: `data/wow/quest/${id}`,
		namespace: 'static',
		zod: QuestResponse,
	})
}

export const QuestCategoriesIndexResponse = LinkSelfResponse.extend({
	categories: z.array(KeyNameIdResponse),
})
export function QuestCategoriesIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof QuestCategoriesIndexResponse>>({
		endpoint: `data/wow/quest/category/index`,
		namespace: 'static',
		zod: QuestCategoriesIndexResponse,
	})
}

export const QuestCategoryResponse = LinkSelfResponse.extend({
	id: z.number(),
	category: LocaleResponse,
	quests: z.array(KeyNameIdResponse),
})
export function QuestCategory(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof QuestCategoryResponse>>({
		endpoint: `data/wow/quest/category/${id}`,
		namespace: 'static',
		zod: QuestCategoryResponse,
	})
}

export const QuestAreasIndexResponse = LinkSelfResponse.extend({
	areas: z.array(KeyNameIdResponse),
})
export function QuestAreasIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof QuestAreasIndexResponse>>({
		endpoint: `data/wow/quest/area/index`,
		namespace: 'static',
		zod: QuestAreasIndexResponse,
	})
}

export const QuestAreaResponse = LinkSelfResponse.extend({
	id: z.number(),
	area: LocaleResponse,
	quests: z.array(KeyNameIdResponse),
})
export function QuestArea(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof QuestAreaResponse>>({
		endpoint: `data/wow/quest/area/${id}`,
		namespace: 'static',
		zod: QuestAreaResponse,
	})
}

export const QuestTypeIndexResponse = LinkSelfResponse.extend({
	types: z.array(KeyNameIdResponse),
})
export function QuestTypeIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof QuestTypeIndexResponse>>({
		endpoint: `data/wow/quest/type/index`,
		namespace: 'static',
		zod: QuestTypeIndexResponse,
	})
}

export const QuestTypeResponse = LinkSelfResponse.extend({
	id: z.number(),
	type: LocaleResponse,
	quests: z.array(KeyNameIdResponse),
})
export function QuestType(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof QuestTypeResponse>>({
		endpoint: `data/wow/quest/type/${id}`,
		namespace: 'static',
		zod: QuestTypeResponse,
	})
}
