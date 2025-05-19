import { WoWClient } from "..";

export function ProfessionIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/profession/index`,
		namespace: "static",
	});
}

export function Profession(this: WoWClient, professionId: number) {
	return this.request({
		endpoint: `data/wow/profession/${professionId}`,
		namespace: "static",
	});
}

export function ProfessionMedia(this: WoWClient, professionId: number) {
	return this.request({
		endpoint: `data/wow/media/profession/${professionId}`,
		namespace: "static",
	});
}

export function ProfessionSkillTier(
	this: WoWClient,
	professionId: number,
	skillTierId: number,
) {
	return this.request({
		endpoint: `data/wow/profession/${professionId}/skill-tier/${skillTierId}`,
		namespace: "static",
	});
}

export function ProfessionRecipe(this: WoWClient, recipeId: number) {
	return this.request({
		endpoint: `data/wow/recipe/${recipeId}`,
		namespace: "static",
	});
}

export function ProfessionRecipeMedia(this: WoWClient, recipeId: number) {
	return this.request({
		endpoint: `data/wow/media/recipe/${recipeId}`,
		namespace: "static",
	});
}
