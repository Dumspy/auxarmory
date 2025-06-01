import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import { LinkSelfResponse, KeyNameIdResponse } from "../../types";

export const PlayableRaceIndexResponse = LinkSelfResponse.extend({
	races: z.array(KeyNameIdResponse),
});

export function PlayableRaceIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof PlayableRaceIndexResponse>>({
		endpoint: `data/wow/playable-race/index`,
		namespace: "static",
		zod: PlayableRaceIndexResponse,
	});
}

export function PlayableRace(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/playable-race/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
