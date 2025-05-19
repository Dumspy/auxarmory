import { WoWClient } from "..";

export function MythicKeystoneLeaderboardIndex(
	this: WoWClient,
	connectedRealmId: number,
) {
	return this.request({
		endpoint: `data/wow/connected-realm/${connectedRealmId}/mythic-leaderboard/index`,
		namespace: "dynamic",
	});
}

export function MyhticKeystoneLeaderboard(
	this: WoWClient,
	connectedRealmId: number,
	dungeonId: number,
	seasonId: number,
) {
	return this.request({
		endpoint: `data/wow/connected-realm/${connectedRealmId}/mythic-leaderboard/${dungeonId}/period/${seasonId}`,
		namespace: "dynamic",
	});
}
