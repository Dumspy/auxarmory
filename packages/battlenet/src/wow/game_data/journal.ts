import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import {
	KeyIdResponse,
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaAssetArray,
	MediaKeyResponse,
	NameIdResponse,
} from "../../types";
import { Faction } from "../types";

export const JournalExpansionsIndexResponse = LinkSelfResponse.extend({
	tiers: z.array(KeyNameIdResponse),
});
export function JournalExpansionsIndex(
	this: WoWGameDataClient,
): Promise<z.infer<typeof JournalExpansionsIndexResponse>> {
	return this.request({
		endpoint: `data/wow/journal-expansion/index`,
		namespace: "static",
	});
}
export const JournalExpansionsResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	dungeons: z.array(KeyNameIdResponse),
	raids: z.array(KeyNameIdResponse),
	world_bosses: z.array(KeyNameIdResponse).optional(),
});
export function JournalExpansions(
	this: WoWGameDataClient,
	id: number,
): Promise<z.infer<typeof JournalExpansionsResponse>> {
	return this.request({
		endpoint: `data/wow/journal-expansion/${id}`,
		namespace: "static",
	});
}

export const JournalEncounterIndexResponse = LinkSelfResponse.extend({
	encounters: z.array(KeyNameIdResponse),
});
export function JournalEncounterIndex(
	this: WoWGameDataClient,
): Promise<z.infer<typeof JournalEncounterIndexResponse>> {
	return this.request({
		endpoint: `data/wow/journal-encounter/index`,
		namespace: "static",
	});
}

const JournalEncounterSectionBase = z.strictObject({
	id: z.number(),
	title: LocaleResponse.optional(),
	body_text: LocaleResponse.optional(),
	spell: KeyNameIdResponse.extend({
		name: KeyNameIdResponse.shape.name.optional(),
	}).optional(),
	creature_display: KeyIdResponse.optional(),
});

type JournalEncounterSectionSchemaType = z.infer<
	typeof JournalEncounterSectionBase
> & {
	sections?: JournalEncounterSectionSchemaType[];
};

const JournalEncounterSection: z.ZodType<JournalEncounterSectionSchemaType> =
	JournalEncounterSectionBase.extend({
		sections: z.lazy(() => z.array(JournalEncounterSection).optional()),
	});

export const JournalEncounterResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	description: LocaleResponse.optional(),
	creatures: z
		.array(
			z.strictObject({
				id: z.number(),
				name: LocaleResponse,
				description: LocaleResponse.optional(),
				creature_display: KeyIdResponse,
			}),
		)
		.optional(),
	items: z
		.array(
			z.strictObject({
				id: z.number(),
				item: KeyNameIdResponse,
			}),
		)
		.optional(),
	sections: z.array(JournalEncounterSection).optional(),
	instance: KeyNameIdResponse.extend({
		name: KeyNameIdResponse.shape.name.optional(),
	}),
	category: z.strictObject({
		type: z.enum(["DUNGEON", "RAID", "WORLD_BOSS", "EVENT"]).optional(),
	}),
	modes: z
		.array(
			z
				.strictObject({
					type: z.enum([
						"NORMAL",
						"HEROIC",
						"MYTHIC",
						"MYTHIC_KEYSTONE",
						"LEGACY_10_MAN",
						"LEGACY_25_MAN",
						"LEGACY_10_MAN_HEROIC",
						"LEGACY_25_MAN_HEROIC",
						"LFR",
					]),
					name: LocaleResponse,
				})
				.or(z.strictObject({})),
		)
		.optional(),
	faction: Faction.optional(),
});
export function JournalEncounter(
	this: WoWGameDataClient,
	id: number,
): Promise<z.infer<typeof JournalEncounterResponse>> {
	return this.request({
		endpoint: `data/wow/journal-encounter/${id}`,
		namespace: "static",
	});
}

export function JournalEncounterSearch(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/search/journal-encounter`,
		namespace: "static",
	});
}

export const JournalInstanceIndexResponse = LinkSelfResponse.extend({
	instances: z.array(KeyNameIdResponse),
});
export function JournalInstanceIndex(
	this: WoWGameDataClient,
): Promise<z.infer<typeof JournalInstanceIndexResponse>> {
	return this.request({
		endpoint: `data/wow/journal-instance/index`,
		namespace: "static",
	});
}

export const JournalInstanceResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	map: NameIdResponse.optional(),
	area: NameIdResponse.optional(),
	description: LocaleResponse.optional(),
	encounters: z.array(KeyNameIdResponse),
	expansion: KeyNameIdResponse,
	location: NameIdResponse.optional(),
	modes: z
		.array(
			z.strictObject({
				mode: z.strictObject({
					type: z.enum([
						"NORMAL",
						"HEROIC",
						"MYTHIC",
						"MYTHIC_KEYSTONE",
						"LEGACY_10_MAN",
						"LEGACY_25_MAN",
						"LEGACY_10_MAN_HEROIC",
						"LEGACY_25_MAN_HEROIC",
						"LFR",
					]),
					name: LocaleResponse,
				}),
				players: z.number(),
				is_tracked: z.boolean(),
				is_timewalking: z.boolean().optional(),
			}),
		)
		.optional(),
	media: MediaKeyResponse,
	minimum_level: z.number().optional(),
	category: z.strictObject({
		type: z.enum(["DUNGEON", "RAID", "WORLD_BOSS", "EVENT"]),
	}),
	order_index: z.number(),
});
export function JournalInstance(
	this: WoWGameDataClient,
	id: number,
): Promise<z.infer<typeof JournalInstanceResponse>> {
	return this.request({
		endpoint: `data/wow/journal-instance/${id}`,
		namespace: "static",
	});
}

export const JournalInstanceMediaResponse = LinkSelfResponse.extend({
	assets: MediaAssetArray,
});

export function JournalInstanceMedia(
	this: WoWGameDataClient,
	id: number,
): Promise<z.infer<typeof JournalInstanceMediaResponse>> {
	return this.request({
		endpoint: `data/wow/media/journal-instance/${id}`,
		namespace: "static",
	});
}
