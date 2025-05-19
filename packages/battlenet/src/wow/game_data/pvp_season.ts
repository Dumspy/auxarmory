import { WoWClient } from "..";

export function PvPSeasonIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/pvp-season/index`,
		namespace: "dynamic",
	});
}

export function PvPSeason(this: WoWClient, pvpSeasonId: number) {
	return this.request({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}`,
		namespace: "dynamic",
	});
}

export function PvPLeaderboardIndex(this: WoWClient, pvpSeasonId: number) {
	return this.request({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}/leaderboard/index`,
		namespace: "dynamic",
	});
}

export function PvPLeaderboard(
	this: WoWClient,
	pvpSeasonId: number,
	pvpBracketId: string,
) {
	return this.request({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}/leaderboard/${pvpBracketId}`,
		namespace: "dynamic",
	});
}

export function PvPRewardIndex(this: WoWClient, pvpSeasonId: number) {
	return this.request({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}/rewards/index`,
		namespace: "dynamic",
	});
}
