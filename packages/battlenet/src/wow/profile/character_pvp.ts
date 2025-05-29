import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function CharacterPvPBracketStatistics(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
	pvpBracket: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/pvp-bracket/${pvpBracket}`,
		namespace: "profile",
		zod: z.unknown(),
	});
}

export function CharacterPvPSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/pvp-summary`,
		namespace: "profile",
		zod: z.unknown(),
	});
}
