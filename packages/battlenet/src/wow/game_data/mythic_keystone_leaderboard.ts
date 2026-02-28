import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyIdResponse,
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
	NameIdResponse,
} from '../../types'
import { ColorObject, FactionEnum } from '../types'
import { CharacterResponse } from '../types/character'

export const MythicKeystoneLeaderboardIndexResponse = LinkSelfResponse.extend({
	current_leaderboards: z.array(KeyNameIdResponse),
})
export function MythicKeystoneLeaderboardIndex(
	this: WoWGameDataClient,
	connectedRealmId: number,
) {
	return this.request<z.infer<typeof MythicKeystoneLeaderboardIndexResponse>>(
		{
			endpoint: `data/wow/connected-realm/${connectedRealmId}/mythic-leaderboard/index`,
			namespace: 'dynamic',
			zod: MythicKeystoneLeaderboardIndexResponse,
		},
	)
}

export const MythicKeystoneLeaderboardResponse = LinkSelfResponse.extend({
	map: NameIdResponse,
	period: z.number(),
	period_start_timestamp: z.number(),
	period_end_timestamp: z.number().optional(),
	connected_realm: KeyResponse,
	leading_groups: z.array(
		z.strictObject({
			ranking: z.number(),
			duration: z.number(),
			completed_timestamp: z.number(),
			keystone_level: z.number(),
			members: z.array(
				z.strictObject({
					profile: CharacterResponse.omit({ key: true }),
					faction: z.strictObject({
						type: FactionEnum,
					}),
					specialization: KeyIdResponse.optional(),
				}),
			),
			mythic_rating: z.strictObject({
				color: ColorObject,
				rating: z.number(),
			}),
		}),
	),
	keystone_affixes: z.array(
		z.strictObject({
			keystone_affix: KeyNameIdResponse,
			starting_level: z.number(),
			max_level: z.number().optional(),
		}),
	),
	map_challenge_mode_id: z.number(),
	name: LocaleResponse,
})
export function MythicKeystoneLeaderboard(
	this: WoWGameDataClient,
	connectedRealmId: number,
	dungeonId: number,
	seasonId: number,
) {
	return this.request<z.infer<typeof MythicKeystoneLeaderboardResponse>>({
		endpoint: `data/wow/connected-realm/${connectedRealmId}/mythic-leaderboard/${dungeonId}/period/${seasonId}`,
		namespace: 'dynamic',
		zod: MythicKeystoneLeaderboardResponse,
	})
}
