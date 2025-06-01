import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import {
	KeyIdResponse,
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
} from "../../types";
import { Faction, FactionEnum } from "../types";
import { CharacterResponse } from "../types/character";
import { PvPBracketType } from "./pvp_tier";

export const PvPSeasonIndexResponse = LinkSelfResponse.extend({
	seasons: z.array(KeyIdResponse),
	current_season: KeyIdResponse,
});
export function PvPSeasonIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof PvPSeasonIndexResponse>>({
		endpoint: `data/wow/pvp-season/index`,
		namespace: "dynamic",
		zod: PvPSeasonIndexResponse,
	});
}

export const PvPSeasonResponse = LinkSelfResponse.extend({
	id: z.number(),
	leaderboards: KeyResponse,
	rewards: KeyResponse,
	season_start_timestamp: z.number(),
	season_end_timestamp: z.number().optional(),
	season_name: LocaleResponse.optional(),
});
// FIXME: This returns 403 for some of the early seasons, this should be caught here.
export function PvPSeason(this: WoWGameDataClient, pvpSeasonId: number) {
	return this.request<z.infer<typeof PvPSeasonResponse>>({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}`,
		namespace: "dynamic",
		zod: PvPSeasonResponse,
	});
}

export const PvPLeaderboardIndexResponse = LinkSelfResponse.extend({
	season: KeyIdResponse,
	leaderboards: z.array(
		z.strictObject({
			key: KeyResponse,
			name: z.string(),
			id: z.number().optional(),
		}),
	),
});
export function PvPLeaderboardIndex(
	this: WoWGameDataClient,
	pvpSeasonId: number,
) {
	return this.request<z.infer<typeof PvPLeaderboardIndexResponse>>({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}/pvp-leaderboard/index`,
		namespace: "dynamic",
		zod: PvPLeaderboardIndexResponse,
	});
}

export const PvPLeaderboardResponse = LinkSelfResponse.extend({
	season: KeyIdResponse,
	name: z.string(),
	bracket: z.strictObject({
		type: PvPBracketType,
		id: z.number(),
	}),
	entries: z
		.array(
			z.strictObject({
				character: CharacterResponse.omit({ key: true }),
				faction: z.strictObject({
					type: FactionEnum,
				}),
				rank: z.number(),
				rating: z.number(),
				season_match_statistics: z.strictObject({
					played: z.number(),
					won: z.number(),
					lost: z.number(),
				}),
				tier: KeyIdResponse,
			}),
		)
		.optional(),
});
export function PvPLeaderboard(
	this: WoWGameDataClient,
	pvpSeasonId: number,
	pvpBracket: string,
) {
	return this.request<z.infer<typeof PvPLeaderboardResponse>>({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}/pvp-leaderboard/${pvpBracket}`,
		namespace: "dynamic",
		zod: PvPLeaderboardResponse,
	});
}

export const PvPRewardIndexResponse = LinkSelfResponse.extend({
	season: KeyIdResponse,
	rewards: z.array(
		z.strictObject({
			bracket: z.strictObject({
				type: PvPBracketType,
				id: z.number(),
			}),
			achievement: KeyNameIdResponse,
			rating_cutoff: z.number(),
			faction: Faction.optional(),
			specialization: KeyNameIdResponse.optional(),
		}),
	),
});
export function PvPRewardIndex(this: WoWGameDataClient, pvpSeasonId: number) {
	return this.request<z.infer<typeof PvPRewardIndexResponse>>({
		endpoint: `data/wow/pvp-season/${pvpSeasonId}/pvp-reward/index`,
		namespace: "dynamic",
		zod: PvPRewardIndexResponse,
	});
}
