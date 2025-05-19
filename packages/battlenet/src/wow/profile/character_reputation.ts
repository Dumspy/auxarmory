import { WoWClient } from "..";

export function CharacterReputationSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/reputations`,
		namespace: "profile",
	});
}
