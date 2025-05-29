import { WoWGameDataClient } from "..";

export function ProfessionIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/profession/index`,
		namespace: "static",
	});
}

export function Profession(this: WoWGameDataClient, professionId: number) {
	return this.request({
		endpoint: `data/wow/profession/${professionId}`,
		namespace: "static",
	});
}

export function ProfessionMedia(this: WoWGameDataClient, professionId: number) {
	return this.request({
		endpoint: `data/wow/media/profession/${professionId}`,
		namespace: "static",
	});
}

export function ProfessionSkillTier(
	this: WoWGameDataClient,
	professionId: number,
	skillTierId: number,
) {
	return this.request({
		endpoint: `data/wow/profession/${professionId}/skill-tier/${skillTierId}`,
		namespace: "static",
	});
}

export function ProfessionRecipe(this: WoWGameDataClient, recipeId: number) {
	return this.request({
		endpoint: `data/wow/recipe/${recipeId}`,
		namespace: "static",
	});
}

export function ProfessionRecipeMedia(
	this: WoWGameDataClient,
	recipeId: number,
) {
	return this.request({
		endpoint: `data/wow/media/recipe/${recipeId}`,
		namespace: "static",
	});
}
