import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function CharacterCollectionIndex(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections`,
		namespace: "profile",
		zod: z.unknown(),
	});
}

export function CharacterHeirloomsCollectionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections/heirlooms`,
		namespace: "profile",
		zod: z.unknown(),
	});
}

export function CharacterMountsCollectionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections/mounts`,
		namespace: "profile",
		zod: z.unknown(),
	});
}

export function CharacterPetsCollectionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections/pets`,
		namespace: "profile",
		zod: z.unknown(),
	});
}

export function CharacterToysCollectionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections/toys`,
		namespace: "profile",
		zod: z.unknown(),
	});
}

export function CharacterTransmogCollectionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections/transmog`,
		namespace: "profile",
		zod: z.unknown(),
	});
}
