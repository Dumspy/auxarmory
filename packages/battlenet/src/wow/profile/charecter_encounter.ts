import { WoWClient } from "..";

export function CharacterEncounterSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/encounters`,
		namespace: "profile",
	});
}

export function CharacterDungeons(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/encounters/dungeons`,
		namespace: "profile",
	});
}

export function CharacterRaid(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/encounters/raids`,
		namespace: "profile",
	});
}
