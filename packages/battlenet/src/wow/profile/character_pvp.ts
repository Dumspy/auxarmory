import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import { KeyIdResponse, LinkSelfResponse, NameIdResponse } from "../../types";
import { PvPBracketType } from "../game_data/pvp_tier";
import { Faction } from "../types";
import { CharacterResponse } from "../types/character";

export const CharacterPvPBracketStatisticsResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	faction: Faction,
	bracket: z.strictObject({
		id: z.number(),
		type: PvPBracketType,
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
	pvpBracket: z.infer<typeof PvPBracketType>,
) {
	return this.request<z.infer<typeof CharacterPvPBracketStatisticsResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/pvp-bracket/${pvpBracket}`,
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
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/pvp-summary`,
		namespace: "profile",
		zod: CharacterPvPSummaryResponse,
	});
}
