import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function RegionIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/region/index`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}

export function Region(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/region/${id}`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}
