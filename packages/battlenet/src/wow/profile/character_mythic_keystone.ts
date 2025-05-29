import z from "zod/v4";

import type { WoWGameDataClient } from "..";
import { KeyNameIdResponse, KeyResponse, LinkSelfResponse } from "../../types";
import { ColorObject } from "../types";
import { CharacterResponse } from "../types/character";

export const CharacterMythicKeystoneProfileIndexResponse =
	LinkSelfResponse.extend({
		current_period: z.strictObject({
			period: z.strictObject({
				key: KeyResponse,
				id: z.number(),
			}),
		}),
		seasons: z.array(
			z.strictObject({
				key: KeyResponse,
				id: z.number(),
			}),
		),
		character: CharacterResponse,
	});

export function CharacterMythicKeystoneProfileIndex(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<
		z.infer<typeof CharacterMythicKeystoneProfileIndexResponse>
	>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/mythic-keystone-profile`,
		namespace: "profile",
		zod: CharacterMythicKeystoneProfileIndexResponse,
	});
}

export const CharacterMythicKeystoneSeasonResponse = LinkSelfResponse.extend({
	season: z.strictObject({
		key: KeyResponse,
		id: z.number(),
	}),
	best_runs: z.array(
		z.strictObject({
			completed_timestamp: z.number(),
			duration: z.number(),
			keystone_level: z.number(),
			keystone_affixes: z.array(KeyNameIdResponse),
			members: z.array(
				z.strictObject({
					character: z.strictObject({
						name: z.string(),
						id: z.number(),
						realm: z.strictObject({
							key: KeyResponse,
							id: z.number(),
							slug: z.string(),
						}),
					}),
					specialization: KeyNameIdResponse,
					race: KeyNameIdResponse,
					equipped_item_level: z.number(),
				}),
			),
			dungeon: KeyNameIdResponse,
			is_completed_within_time: z.boolean(),
			mythic_rating: z.strictObject({
				color: ColorObject,
				rating: z.number(),
			}),
		}),
	),
	character: CharacterResponse,
	mythic_rating: z.strictObject({
		color: ColorObject,
		rating: z.number(),
	}),
});

export function CharacterMythicKeystoneSeason(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
	seasonId: number,
) {
	return this.request<z.infer<typeof CharacterMythicKeystoneSeasonResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/mythic-keystone-profile/season/${seasonId}`,
		namespace: "profile",
		zod: CharacterMythicKeystoneSeasonResponse,
	});
}
