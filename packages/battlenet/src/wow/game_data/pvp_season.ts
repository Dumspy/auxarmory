import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function PvPSeasonIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/pvp-season/index`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}

export function PvPSeason(this: WoWGameDataClient, pvpSeasonId: number) {
	return this.request<unknown>({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}

export function PvPLeaderboardIndex(
	this: WoWGameDataClient,
	pvpSeasonId: number,
) {
	return this.request<unknown>({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}/leaderboard/index`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}

export function PvPLeaderboard(
	this: WoWGameDataClient,
	pvpSeasonId: number,
	pvpBracketId: string,
) {
	return this.request<unknown>({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}/leaderboard/${pvpBracketId}`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}

export function PvPRewardIndex(this: WoWGameDataClient, pvpSeasonId: number) {
	return this.request<unknown>({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}/rewards/index`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}
