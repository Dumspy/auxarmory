import type { WoWGameDataClient } from "..";

export function CharacterHunterPetsSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/hunter-pets`,
		namespace: "profile",
	});
}
