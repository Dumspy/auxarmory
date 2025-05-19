import { WoWClient } from "..";

export function CharacterPvPBracketStatistics(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
	pvpBracket: string,
) {
	// TODO: Check if string could be union
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/pvp-bracket/${pvpBracket}`,
		namespace: "profile",
	});
}

export function CharacterPvPSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/pvp-summary`,
		namespace: "profile",
	});
}
