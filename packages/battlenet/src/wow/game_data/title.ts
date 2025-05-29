import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function TitleIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/title/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function Title(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/title/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
