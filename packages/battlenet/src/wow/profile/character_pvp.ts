import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import { KeyIdResponse, LinkSelfResponse, NameIdResponse } from "../../types";
import { Faction } from "../types";
import { CharacterResponse } from "../types/character";

export const CharacterPvPBracketStatisticsResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	faction: Faction,
	bracket: z.strictObject({
		id: z.number(),
		type: z.enum(["ARENA_2v2", "ARENA_3v3", "ARENA_10v10"]),
	}),
	rating: z.number(),
	season: KeyIdResponse,
	tier: KeyIdResponse,
	season_match_statistics: z.strictObject({
		played: z.number(),
		won: z.number(),
		lost: z.number(),
	}),
	weekly_match_statistics: z.strictObject({
		played: z.number(),
		won: z.number(),
		lost: z.number(),
	}),
});
export function CharacterPvPBracketStatistics(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
	pvpBracket: "2v2" | "3v3" | "10v10",
) {
	return this.request<z.infer<typeof CharacterPvPBracketStatisticsResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/pvp-bracket/${pvpBracket}`,
		namespace: "profile",
		zod: CharacterPvPBracketStatisticsResponse,
	});
}

export const CharacterPvPSummaryResponse = LinkSelfResponse.extend({
	honor_level: z.number(),
	pvp_map_statistics: z
		.array(
			z.strictObject({
				world_map: NameIdResponse,
				match_statistics: z.strictObject({
					played: z.number(),
					won: z.number(),
					lost: z.number(),
				}),
			}),
		)
		.optional(),
	honorable_kills: z.number(),
	character: CharacterResponse,
});
export function CharacterPvPSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterPvPSummaryResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/pvp-summary`,
		namespace: "profile",
		zod: CharacterPvPSummaryResponse,
	});
}
