import { WoWClient } from "..";

export function CharacterTitlesSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/titles`,
		namespace: "profile",
	});
}
