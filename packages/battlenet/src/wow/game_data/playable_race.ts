import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function PlayableRaceIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/playable-race/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function PlayableRace(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/playable-race/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
