import { WoWGameDataClient } from "..";

export function CharacterProfileSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}`,
		namespace: "profile",
	});
}

export function CharacterProfileStatus(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/status`,
		namespace: "profile",
	});
}
