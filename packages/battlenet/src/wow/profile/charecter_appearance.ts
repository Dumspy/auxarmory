import { WoWGameDataClient } from "..";

export function CharacterAppearanceSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/appearance`,
		namespace: "profile",
	});
}
