import { z } from "zod/v4"
import { WoWGameDataClient } from ".."
import { KeyNameIdResponse, LinkSelfResponse, LocaleResponse, MediaKeyResponse } from "../../types"
import { HeirloomItem } from "../types/item";

export const HeirloomIndexResponse = LinkSelfResponse.extend({
	heirlooms: z.array(KeyNameIdResponse)
})
export function HeirloomIndex(this: WoWGameDataClient): Promise<z.infer<typeof HeirloomIndexResponse>> {
	return this.request({
		endpoint: `data/wow/heirloom/index`,
		namespace: "static",
	});
}

export const HeirloomResponse = LinkSelfResponse.extend({
	id: z.number(),
	item: KeyNameIdResponse,
	source: z.strictObject({
		type: z.enum(["VENDOR", "WORLDEVENT", "DROP", "OTHER", "QUEST"]),
		name: LocaleResponse
	}),
	source_description: LocaleResponse.optional(),
	upgrades: z.array(
		z.strictObject({
			item: HeirloomItem,
			level: z.number(),
		})
	),
	media: MediaKeyResponse
})
export function Heirloom(this: WoWGameDataClient, id: number): Promise<z.infer<typeof HeirloomResponse>> {
	return this.request({
		endpoint: `data/wow/heirloom/${id}`,
		namespace: "static",
	});
}
