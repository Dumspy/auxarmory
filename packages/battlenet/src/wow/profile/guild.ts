import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import {
	KeyIdResponse,
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaKeyResponse,
} from "../../types";
import { ColorObject, Faction, Realm } from "../types";
import { CharacterResponse } from "../types/character";

const SimpleGuild = z.strictObject({
	key: KeyResponse,
	name: z.string(),
	id: z.number(),
	realm: Realm,
	faction: Faction,
});

export const GuildResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: z.string(),
	faction: Faction,
	achievement_points: z.number(),
	member_count: z.number(),
	realm: Realm,
	crest: z.strictObject({
		emblem: z.strictObject({
			id: z.number(),
			media: MediaKeyResponse,
			color: z.strictObject({
				id: z.number(),
				rgba: ColorObject,
			}),
		}),
		border: z.strictObject({
			id: z.number(),
			media: MediaKeyResponse,
			color: z.strictObject({
				id: z.number(),
				rgba: ColorObject,
			}),
		}),
		background: z.strictObject({
			color: z.strictObject({
				id: z.number(),
				rgba: ColorObject,
			}),
		}),
	}).optional(),
	roster: KeyResponse,
	achievements: KeyResponse,
	created_timestamp: z.number(),
	activity: KeyResponse,
	name_search: z.string(),
});

export function Guild(
	this: WoWGameDataClient,
	realmSlug: string,
	nameSlug: string,
) {
	return this.request<z.infer<typeof GuildResponse>>({
		endpoint: `data/wow/guild/${realmSlug}/${nameSlug}`,
		namespace: "profile",
		zod: GuildResponse,
	});
}

const GuildActivityType = z.union([
	z.strictObject({
		encounter_completed: z.strictObject({
			encounter: KeyNameIdResponse,
			mode: z.strictObject({
				name: LocaleResponse,
				type: z.enum(["NORMAL", "HEROIC", "MYTHIC", "MYTHIC_KEYSTONE"]),
			}),
		}),
		activity: z.strictObject({
			type: z.literal("ENCOUNTER"),
		}),
		timestamp: z.number(),
	}),
	z.strictObject({
		character_achievement: z.strictObject({
			character: CharacterResponse,
			achievement: KeyNameIdResponse,
		}),
		activity: z.strictObject({
			type: z.literal("CHARACTER_ACHIEVEMENT"),
		}),
		timestamp: z.number(),
	}),
]);

export const GuildActivityResponse = LinkSelfResponse.extend({
	guild: SimpleGuild,
	activities: z.array(GuildActivityType),
});
export function GuildActivity(
	this: WoWGameDataClient,
	realmSlug: string,
	nameSlug: string,
) {
	return this.request<z.infer<typeof GuildActivityResponse>>({
		endpoint: `data/wow/guild/${realmSlug}/${nameSlug}/activity`,
		namespace: "profile",
		zod: GuildActivityResponse,
	});
}

export const GuildAchievementsResponse = LinkSelfResponse.extend({
	guild: SimpleGuild,
	total_quantity: z.number(),
	total_points: z.number(),
	achievements: z.array(
		z.strictObject({
			id: z.number(),
			achievement: KeyNameIdResponse,
			criteria: z.strictObject({
				id: z.number(),
				amount: z.number().optional(),
				is_completed: z.boolean(),
				child_criteria: z
					.array(
						z.strictObject({
							id: z.number(),
							amount: z.number(),
							is_completed: z.boolean(),
						}),
					)
					.optional(),
			}),
			completed_timestamp: z.number().optional(),
		}),
	),
	category_progress: z.array(
		z.strictObject({
			category: KeyNameIdResponse,
			quantity: z.number(),
			points: z.number(),
		}),
	),
	recent_events: z.array(
		z.strictObject({
			achievement: KeyNameIdResponse,
			timestamp: z.number(),
		}),
	),
});
export function GuildAchievements(
	this: WoWGameDataClient,
	realmSlug: string,
	nameSlug: string,
) {
	return this.request<z.infer<typeof GuildAchievementsResponse>>({
		endpoint: `data/wow/guild/${realmSlug}/${nameSlug}/achievements`,
		namespace: "profile",
		zod: GuildAchievementsResponse,
	});
}

export const GuildRosterResponse = LinkSelfResponse.extend({
	guild: SimpleGuild,
	members: z.array(
		z.strictObject({
			character: CharacterResponse.extend({
				realm: Realm.omit({ name: true }),
				level: z.int().min(1).max(80),
				playable_class: KeyIdResponse,
				playable_race: KeyIdResponse,
				faction: Faction.omit({ name: true }),
			}),
			rank: z.number(),
		}),
	),
});

export function GuildRoster(
	this: WoWGameDataClient,
	realmSlug: string,
	nameSlug: string,
) {
	return this.request<z.infer<typeof GuildRosterResponse>>({
		endpoint: `data/wow/guild/${realmSlug}/${nameSlug}/roster`,
		namespace: "profile",
		zod: GuildRosterResponse,
	});
}
