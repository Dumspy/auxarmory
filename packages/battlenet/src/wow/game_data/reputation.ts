import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function ReputationFactionIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/reputation-faction/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function ReputationFaction(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/reputation-faction/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function ReputationTiersIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/reputation-tiers/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function ReputationTiers(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/reputation-tiers/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
