import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function Spell(this: WoWGameDataClient, spellId: number) {
	return this.request<unknown>({
		endpoint: `data/wow/spell/${spellId}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function SpellMedia(this: WoWGameDataClient, spellId: number) {
	return this.request<unknown>({
		endpoint: `data/wow/media/spell/${spellId}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function SpellSearch(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/search/spell`,
		namespace: "static",
		zod: z.unknown(),
	});
}
