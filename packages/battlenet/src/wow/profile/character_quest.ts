import { WoWClient } from "..";

export function CharacterQuests(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/quests`,
		namespace: "profile",
	});
}

export function CharacterCompletedQuests(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/quests/completed`,
		namespace: "profile",
	});
}
