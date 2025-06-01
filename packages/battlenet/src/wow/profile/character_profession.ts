import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import { KeyNameIdResponse, LinkSelfResponse } from "../../types";
import { CharacterResponse } from "../types/character";

const ProfessionTier = z.array(
	z.strictObject({
		skill_points: z.number(),
		max_skill_points: z.number(),
		tier: z.strictObject({
			id: z.number(),
			name: z.string(),
		}),
		known_recipes: z.array(KeyNameIdResponse).optional(),
	}),
);

export const CharacterProfessionSummaryResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	primaries: z
		.array(
			z.strictObject({
				profession: KeyNameIdResponse,
				tiers: ProfessionTier,
			}),
		)
		.optional(),
	secondaries: z
		.array(
			z.strictObject({
				profession: KeyNameIdResponse,
				skill_points: z.number().optional(),
				max_skill_points: z.number().optional(),
				tiers: ProfessionTier.optional(),
			}),
		)
		.optional(),
});

export function CharacterProfessionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterProfessionSummaryResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/professions`,
		namespace: "profile",
		zod: CharacterProfessionSummaryResponse,
	});
}
