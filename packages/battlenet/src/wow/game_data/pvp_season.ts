import type { WoWGameDataClient } from "..";

export function PvPSeasonIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/pvp-season/index`,
		namespace: "dynamic",
	});
}

export function PvPSeason(this: WoWGameDataClient, pvpSeasonId: number) {
	return this.request({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}`,
		namespace: "dynamic",
	});
}

export function PvPLeaderboardIndex(
	this: WoWGameDataClient,
	pvpSeasonId: number,
) {
	return this.request({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}/leaderboard/index`,
		namespace: "dynamic",
	});
}

export function PvPLeaderboard(
	this: WoWGameDataClient,
	pvpSeasonId: number,
	pvpBracketId: string,
) {
	return this.request({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}/leaderboard/${pvpBracketId}`,
		namespace: "dynamic",
	});
}

export function PvPRewardIndex(this: WoWGameDataClient, pvpSeasonId: number) {
	return this.request({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}/rewards/index`,
		namespace: "dynamic",
	});
}
