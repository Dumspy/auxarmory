import { WoWGameDataClient } from "..";

export function CharacterSpecializationsSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/specializations`,
		namespace: "profile",
	});
}
