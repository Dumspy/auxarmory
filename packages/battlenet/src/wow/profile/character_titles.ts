import { WoWGameDataClient } from "..";

export function CharacterTitlesSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/titles`,
		namespace: "profile",
	});
}
