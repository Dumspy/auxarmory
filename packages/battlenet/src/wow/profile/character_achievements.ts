import { WoWGameDataClient } from "..";

export function CharacterAchievementsSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/achievements`,
		namespace: "profile",
	});
}

export function CharacterAchievementsStatistics(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/achievements/statistics`,
		namespace: "profile",
	});
}
