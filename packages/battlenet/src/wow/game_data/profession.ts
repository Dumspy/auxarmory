import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function ProfessionIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/profession/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function Profession(this: WoWGameDataClient, professionId: number) {
	return this.request<unknown>({
		endpoint: `data/wow/profession/${professionId}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function ProfessionMedia(this: WoWGameDataClient, professionId: number) {
	return this.request<unknown>({
		endpoint: `data/wow/media/profession/${professionId}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function ProfessionSkillTier(
	this: WoWGameDataClient,
	professionId: number,
	skillTierId: number,
) {
	return this.request<unknown>({
		endpoint: `data/wow/profession/${professionId}/skill-tier/${skillTierId}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function ProfessionRecipe(this: WoWGameDataClient, recipeId: number) {
	return this.request<unknown>({
		endpoint: `data/wow/recipe/${recipeId}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function ProfessionRecipeMedia(
	this: WoWGameDataClient,
	recipeId: number,
) {
	return this.request<unknown>({
		endpoint: `data/wow/media/recipe/${recipeId}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
