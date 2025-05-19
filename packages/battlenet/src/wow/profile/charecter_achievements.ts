import { WoWClient } from "..";

export function CharacterAchievementsSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/achievements`,
		namespace: "profile",
	});
}

export function CharacterAchievementsStatistics(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/achievements/statistics`,
		namespace: "profile",
	});
}
