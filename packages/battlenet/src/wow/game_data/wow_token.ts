import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function WoWTokenIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/token/index`,
		namespace: "dynamic",
		zod: z.unknown(),
	});
}
