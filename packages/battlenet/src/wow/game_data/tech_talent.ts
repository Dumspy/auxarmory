import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function TechTalentTreeIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/tech-talent-tree/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function TechTalentTree(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/tech-talent-tree/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function TechTalentIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/tech-talent/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function TechTalent(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/tech-talent/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function TechTalentMedia(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/media/tech-talent/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
