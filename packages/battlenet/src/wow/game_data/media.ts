import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function MediaSearch(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/media/search`,
		namespace: "static",
		zod: z.unknown(),
	});
}
