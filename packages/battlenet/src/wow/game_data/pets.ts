import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function PetIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/pet/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function Pet(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/pet/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function PetMedia(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/media/pet/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function PetAbilitiesIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/pet-ability/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function PetAbility(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/pet-ability/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function PetAbilityMedia(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/media/pet-ability/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
