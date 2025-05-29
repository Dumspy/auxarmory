import type { WoWGameDataClient } from "..";

export function MyhticRaidLeaderboard(
	this: WoWGameDataClient,
	raid: string,
	faction: "horde" | "alliance",
) {
	return this.request({
		endpoint: `data/wow/leaderboard/hall-of-fame/${raid}/${faction}`,
		namespace: "dynamic",
	});
}
