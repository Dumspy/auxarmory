import { WoWClient } from "..";

export function PetIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/pet/index`,
		namespace: "static",
	});
}

export function Pet(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/pet/${id}`,
		namespace: "static",
	});
}

export function PetMedia(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/pet/${id}`,
		namespace: "static",
	});
}

export function PetAbilitiesIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/pet-ability/index`,
		namespace: "static",
	});
}

export function PetAbility(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/pet-ability/${id}`,
		namespace: "static",
	});
}

export function PetAbilityMedia(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/pet-ability/${id}`,
		namespace: "static",
	});
}
