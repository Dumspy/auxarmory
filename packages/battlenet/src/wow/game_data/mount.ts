import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function MountIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/mount/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function Mount(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/mount/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function MountSearch(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/mount/search`,
		namespace: "static",
		zod: z.unknown(),
	});
}
