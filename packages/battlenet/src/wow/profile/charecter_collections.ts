import { WoWClient } from "..";

export function CharacterCollectionIndex(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections`,
		namespace: "profile",
	});
}

export function CharacterHeirloomsCollectionSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections/heirlooms`,
		namespace: "profile",
	});
}

export function CharacterMountsCollectionSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections/mounts`,
		namespace: "profile",
	});
}

export function CharacterPetsCollectionSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections/pets`,
		namespace: "profile",
	});
}

export function CharacterToysCollectionSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections/toys`,
		namespace: "profile",
	});
}

export function CharacterTransmogCollectionSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/collections/transmog`,
		namespace: "profile",
	});
}
