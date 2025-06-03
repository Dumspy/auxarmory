import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import {
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
} from "../../types";
import { Faction, Gender, Realm } from "../types";

export const CharacterProfileSummaryResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: z.string(),
	gender: Gender,
	faction: Faction,
	race: KeyNameIdResponse,
	character_class: KeyNameIdResponse,
	active_spec: KeyNameIdResponse.optional(),
	realm: Realm,
	guild: z
		.strictObject({
			key: KeyResponse,
			name: z.string(),
			id: z.number(),
			realm: Realm,
			faction: Faction,
		})
		.optional(),
	level: z.number(),
	experience: z.number(),
	achievement_points: z.number(),
	achievements: KeyResponse,
	titles: KeyResponse,
	pvp_summary: KeyResponse,
	encounters: KeyResponse,
	media: KeyResponse,
	last_login_timestamp: z.number(),
	average_item_level: z.number(),
	equipped_item_level: z.number(),
	specializations: KeyResponse,
	statistics: KeyResponse,
	mythic_keystone_profile: KeyResponse,
	equipment: KeyResponse,
	appearance: KeyResponse,
	collections: KeyResponse,
	reputations: KeyResponse,
	quests: KeyResponse,
	achievements_statistics: KeyResponse,
	professions: KeyResponse,
	covenant_progress: z
		.strictObject({
			chosen_covenant: KeyNameIdResponse,
			renown_level: z.number(),
			soulbinds: KeyResponse,
		})
		.optional(),
	active_title: KeyNameIdResponse.extend({
		display_string: LocaleResponse,
	}).optional(),
	name_search: z.string(),
	is_remix: z.boolean().optional(),
	hunter_pets: KeyResponse.optional(),
});

export function CharacterProfileSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterProfileSummaryResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}`,
		namespace: "profile",
		zod: CharacterProfileSummaryResponse,
	});
}

export const CharacterProfileStatusResponse = LinkSelfResponse.extend({
	id: z.number(),
	is_valid: z.boolean(),
});

export function CharacterProfileStatus(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterProfileStatusResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/status`,
		namespace: "profile",
		zod: CharacterProfileStatusResponse,
	});
}
