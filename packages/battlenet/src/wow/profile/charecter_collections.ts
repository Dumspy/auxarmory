import { WoWGameDataClient } from "..";

export function CharacterCollectionIndex(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections`,
		namespace: "profile",
	});
}

export function CharacterHeirloomsCollectionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections/heirlooms`,
		namespace: "profile",
	});
}

export function CharacterMountsCollectionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections/mounts`,
		namespace: "profile",
	});
}

export function CharacterPetsCollectionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections/pets`,
		namespace: "profile",
	});
}

export function CharacterToysCollectionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections/toys`,
		namespace: "profile",
	});
}

export function CharacterTransmogCollectionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections/transmog`,
		namespace: "profile",
	});
}
