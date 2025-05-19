import { WoWClient } from "..";

export function MyhticRaidLeaderboard(
	this: WoWClient,
	raid: string,
	faction: "horde" | "alliance",
) {
	return this.request({
		endpoint: `data/wow/leaderboard/hall-of-fame/${raid}/${faction}`,
		namespace: "dynamic",
	});
}
