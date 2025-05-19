import { WoWClient } from "..";

export function CharacterAppearanceSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/appearance`,
		namespace: "profile",
	});
}
