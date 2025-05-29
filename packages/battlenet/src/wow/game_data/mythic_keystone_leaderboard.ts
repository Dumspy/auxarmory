import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function MythicKeystoneLeaderboardIndex(
	this: WoWGameDataClient,
	connectedRealmId: number,
) {
	return this.request<unknown>({
		endpoint: `data/wow/connected-realm/${connectedRealmId}/mythic-leaderboard/index`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}

export function MyhticKeystoneLeaderboard(
	this: WoWGameDataClient,
	connectedRealmId: number,
	dungeonId: number,
	seasonId: number,
) {
	return this.request<unknown>({
		endpoint: `data/wow/connected-realm/${connectedRealmId}/mythic-leaderboard/${dungeonId}/period/${seasonId}`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}
