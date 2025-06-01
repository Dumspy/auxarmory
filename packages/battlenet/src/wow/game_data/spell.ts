import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import {
	LinkSelfResponse,
	LocaleResponse,
	MediaAssetArray,
	MediaKeyResponse,
} from "../../types";

export const SpellResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	description: LocaleResponse,
	media: MediaKeyResponse,
});
export function Spell(this: WoWGameDataClient, spellId: number) {
	return this.request<z.infer<typeof SpellResponse>>({
		endpoint: `data/wow/spell/${spellId}`,
		namespace: "static",
		zod: SpellResponse,
	});
}

export const SpellMediaResponse = LinkSelfResponse.extend({
	id: z.number(),
	assets: MediaAssetArray,
});
export function SpellMedia(this: WoWGameDataClient, spellId: number) {
	return this.request<z.infer<typeof SpellMediaResponse>>({
		endpoint: `data/wow/media/spell/${spellId}`,
		namespace: "static",
		zod: SpellMediaResponse,
	});
}

export function SpellSearch(this: WoWGameDataClient, params: URLSearchParams) {
	return this.request<unknown>({
		endpoint: `data/wow/search/spell`,
		namespace: "static",
		zod: z.unknown(),
		params,
	});
}
