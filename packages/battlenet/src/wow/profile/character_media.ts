import { WoWGameDataClient } from "..";

export function CharacterMediaSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/character-media`,
		namespace: "profile",
	});
}
