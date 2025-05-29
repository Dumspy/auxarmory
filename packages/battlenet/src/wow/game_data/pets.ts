import type { WoWGameDataClient } from "..";

export function PetIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/pet/index`,
		namespace: "static",
	});
}

export function Pet(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/pet/${id}`,
		namespace: "static",
	});
}

export function PetMedia(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/pet/${id}`,
		namespace: "static",
	});
}

export function PetAbilitiesIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/pet-ability/index`,
		namespace: "static",
	});
}

export function PetAbility(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/pet-ability/${id}`,
		namespace: "static",
	});
}

export function PetAbilityMedia(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/pet-ability/${id}`,
		namespace: "static",
	});
}
