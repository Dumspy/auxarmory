import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function MyhticKeystoneAffixesIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/keystone-affix/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function MyhticKeystoneAffix(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/keystone-affix/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function MyhticKeystoneAffixMedia(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/media/keystone-affix/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
