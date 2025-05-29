import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function CharacterAchievementsSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/achievements`,
		namespace: "profile",
		zod: z.unknown(),
	});
}

export function CharacterAchievementsStatistics(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/achievements/statistics`,
		namespace: "profile",
		zod: z.unknown(),
	});
}
