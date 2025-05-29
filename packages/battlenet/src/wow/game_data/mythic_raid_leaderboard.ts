import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function MyhticRaidLeaderboard(
	this: WoWGameDataClient,
	raid: string,
	faction: "horde" | "alliance",
) {
	return this.request<unknown>({
		endpoint: `data/wow/leaderboard/hall-of-fame/${raid}/${faction}`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}
