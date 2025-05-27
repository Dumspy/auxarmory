import { WoWGameDataClient } from "..";

export function CharacterProfessionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/professions`,
		namespace: "profile",
	});
}
