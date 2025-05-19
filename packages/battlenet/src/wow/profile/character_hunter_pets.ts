import { WoWClient } from "..";

export function CharacterHunterPetsSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/hunter-pets`,
		namespace: "profile",
	});
}
