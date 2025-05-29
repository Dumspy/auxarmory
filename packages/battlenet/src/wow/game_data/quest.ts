import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function QuestIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/quest/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function Quest(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/quest/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function QuestCategoriesIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/quest/category/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function QuestCategory(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/quest/category/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function QuestAreasIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/quest/area/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function QuestArea(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/quest/area/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function QuestTypeIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/quest/type/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

// TODO: Define a proper Zod schema for QuestTypeResponse and replace z.unknown()
export function QuestType(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/quest/type/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
