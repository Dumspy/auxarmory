import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function RealmIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/realm/index`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}

export function Realm(this: WoWGameDataClient, slug: string) {
	return this.request<unknown>({
		endpoint: `data/wow/realm/${slug}`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}

export function RealmSearch(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/search/realm`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}
