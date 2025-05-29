import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function Auctions(this: WoWGameDataClient, realm: number) {
	return this.request<unknown>({
		endpoint: `data/wow/connected-realm/${realm}/auctions`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}

export function AuctionCommodities(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/auctions/commodities`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}
