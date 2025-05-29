import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function ToyIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/toy/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function Toy(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/toy/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
