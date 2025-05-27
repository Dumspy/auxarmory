import { z } from "zod/v4";
import { WoWGameDataClient } from "..";
import { LinkSelfResponse, MediaAssetArray, MediaKeyResponse } from "../../types";
import { ColorObject } from "../types";

export const GuildCrestIndexResponse = LinkSelfResponse.extend({
	emblems: z.array(
		z.strictObject({
			id: z.number(),
			media: MediaKeyResponse,
		}),
	),
	borders: z.array(
		z.strictObject({
			id: z.number(),
			media: MediaKeyResponse,
		}),
	),
	colors: z.strictObject({
		emblems: z.array(
			z.strictObject({
				id: z.number(),
				rgba: ColorObject,
			}),
		),
		borders: z.array(
			z.strictObject({
				id: z.number(),
				rgba: ColorObject,
			}),
		),
		backgrounds: z.array(
			z.strictObject({
				id: z.number(),
				rgba: ColorObject,
			}),
		),
	}),
})
export function GuildCrestIndex(
	this: WoWGameDataClient,
): Promise<z.infer<typeof GuildCrestIndexResponse>> {
	return this.request({
		endpoint: `data/wow/guild-crest/index`,
		namespace: "static",
	});
}

export const GuildCrestBorderMediaResponse = LinkSelfResponse.extend({
	id: z.number(),
	assets: MediaAssetArray,
})
export function GuildCrestBorderMedia(this: WoWGameDataClient, id: number): Promise<z.infer<typeof GuildCrestBorderMediaResponse>> {
	return this.request({
		endpoint: `data/wow/media/guild-crest/border/${id}`,
		namespace: "static",
	});
}

export const GuildCrestsEmblemMediaResponse = LinkSelfResponse.extend({
	id: z.number(),
	assets: MediaAssetArray,
})
export function GuildCrestsEmblemMedia(this: WoWGameDataClient, id: number): Promise<z.infer<typeof GuildCrestsEmblemMediaResponse>> {
	return this.request({
		endpoint: `data/wow/media/guild-crest/emblem/${id}`,
		namespace: "static",
	});
}
