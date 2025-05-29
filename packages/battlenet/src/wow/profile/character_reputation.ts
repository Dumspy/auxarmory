import type { WoWGameDataClient } from "..";

export function CharacterReputationSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/reputations`,
		namespace: "profile",
	});
}
