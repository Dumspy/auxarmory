import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import {
	LinkSelfResponse,
	MediaAssetArray,
	MediaKeyResponse,
} from "../../types";
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
});
export function GuildCrestIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof GuildCrestIndexResponse>>({
		endpoint: `data/wow/guild-crest/index`,
		namespace: "static",
		zod: GuildCrestIndexResponse,
	});
}

export const GuildCrestBorderMediaResponse = LinkSelfResponse.extend({
	id: z.number(),
	assets: MediaAssetArray,
});
export function GuildCrestBorderMedia(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof GuildCrestBorderMediaResponse>>({
		endpoint: `data/wow/media/guild-crest/border/${id}`,
		namespace: "static",
		zod: GuildCrestBorderMediaResponse,
	});
}

export const GuildCrestsEmblemMediaResponse = LinkSelfResponse.extend({
	id: z.number(),
	assets: MediaAssetArray,
});
export function GuildCrestsEmblemMedia(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof GuildCrestsEmblemMediaResponse>>({
		endpoint: `data/wow/media/guild-crest/emblem/${id}`,
		namespace: "static",
		zod: GuildCrestsEmblemMediaResponse,
	});
}
