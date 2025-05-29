import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function PvPTierIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/pvp-tier/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function PvPTier(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/pvp-tier/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function PvPTierMedia(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/media/pvp-tier/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
