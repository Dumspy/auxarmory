import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import { KeyResponse, LinkSelfResponse, LocaleResponse } from "../../types";

export const RegionIndexResponse = LinkSelfResponse.extend({
	regions: z.array(KeyResponse),
});
export function RegionIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof RegionIndexResponse>>({
		endpoint: `data/wow/region/index`,
		namespace: "dynamic",
		zod: RegionIndexResponse,
	});
}

export const RegionResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	tag: z.enum(["EU", "US", "KR", "TW", "CN"]),
	patch_string: z.string(),
});
export function Region(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof RegionResponse>>({
		endpoint: `data/wow/region/${id}`,
		namespace: "dynamic",
		zod: RegionResponse,
	});
}
