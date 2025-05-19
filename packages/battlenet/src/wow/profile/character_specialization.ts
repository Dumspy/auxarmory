import { WoWClient } from "..";

export function CharacterSpecializationsSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/specializations`,
		namespace: "profile",
	});
}
