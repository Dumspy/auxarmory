import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function TalentTreeIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/talent-tree/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function TalentTree(
	this: WoWGameDataClient,
	talentTreeId: number,
	specId: number,
) {
	return this.request<unknown>({
		endpoint: `data/wow/talent-tree/${talentTreeId}/playable-specialization/${specId}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function TalentTreeNodes(this: WoWGameDataClient, talentTreeId: number) {
	return this.request<unknown>({
		endpoint: `data/wow/talent-tree/${talentTreeId}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function TalentIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/talent/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function Talent(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/talent/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function PvPTalentIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/pvp-talent/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function PvPTalent(this: WoWGameDataClient, pvpTalentId: number) {
	return this.request<unknown>({
		endpoint: `data/wow/pvp-talent/${pvpTalentId}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
