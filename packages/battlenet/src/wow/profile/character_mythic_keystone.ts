import z from 'zod/v4'

import type { WoWGameDataClient } from '..'
import { KeyNameIdResponse, KeyResponse, LinkSelfResponse } from '../../types'
import { ColorObject } from '../types'
import { CharacterResponse } from '../types/character'

const MythicRating = z.strictObject({
	color: ColorObject,
	rating: z.number(),
})

const BestRun = z.strictObject({
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
	mythic_rating: MythicRating,
	map_rating: MythicRating,
})

export const CharacterMythicKeystoneProfileIndexResponse =
	LinkSelfResponse.extend({
		current_period: z.strictObject({
			period: z.strictObject({
				key: KeyResponse,
				id: z.number(),
			}),
			best_runs: z.array(BestRun).optional(),
		}),
		seasons: z
			.array(
				z.strictObject({
					key: KeyResponse,
					id: z.number(),
				}),
			)
			.optional(),
		character: CharacterResponse,
		current_mythic_rating: MythicRating.optional(),
	})

export function CharacterMythicKeystoneProfileIndex(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<
		z.infer<typeof CharacterMythicKeystoneProfileIndexResponse>
	>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/mythic-keystone-profile`,
		namespace: 'profile',
		zod: CharacterMythicKeystoneProfileIndexResponse,
	})
}

export const CharacterMythicKeystoneSeasonResponse = LinkSelfResponse.extend({
	season: z.strictObject({
		key: KeyResponse,
		id: z.number(),
	}),
	best_runs: z.array(BestRun),
	character: CharacterResponse,
	mythic_rating: MythicRating,
})

export function CharacterMythicKeystoneSeason(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
	seasonId: number,
) {
	return this.request<z.infer<typeof CharacterMythicKeystoneSeasonResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/mythic-keystone-profile/season/${seasonId}`,
		namespace: 'profile',
		zod: CharacterMythicKeystoneSeasonResponse,
	})
}
