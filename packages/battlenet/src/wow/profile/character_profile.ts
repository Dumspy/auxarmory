import { WoWClient } from "..";

export function CharacterProfileSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}`,
		namespace: "profile",
	});
}

export function CharacterProfileStatus(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/status`,
		namespace: "profile",
	});
}
