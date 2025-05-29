import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function PowerTypeIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/power-type/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function PowerType(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/power-type/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
