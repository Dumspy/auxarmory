import { WoWClient } from "..";

export function CharacterProfessionSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/professions`,
		namespace: "profile",
	});
}
