import type { WoWGameDataClient } from "..";

export function CharacterQuests(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/quests`,
		namespace: "profile",
	});
}

export function CharacterCompletedQuests(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/quests/completed`,
		namespace: "profile",
	});
}
