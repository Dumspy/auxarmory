import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import { KeyNameIdResponse, LinkSelfResponse, RegionsEnum } from '../../types'
import { FactionEnum, Realm } from '../types'

export const MythicRaidLeaderboardResponse = LinkSelfResponse.extend({
	slug: z.string(),
	criteria_type: z.enum(['hall-of-fame']),
	entries: z.array(
		z.strictObject({
			guild: z.strictObject({
				name: z.string(),
				id: z.number(),
				realm: Realm.omit({ key: true }),
			}),
			faction: z.strictObject({
				type: FactionEnum,
			}),
			timestamp: z.number(),
			region: RegionsEnum,
			rank: z.number(),
		}),
	),
	journal_instance: KeyNameIdResponse,
})
export function MythicRaidLeaderboard(
	this: WoWGameDataClient,
	raid: string,
	faction: 'horde' | 'alliance',
) {
	return this.request<z.infer<typeof MythicRaidLeaderboardResponse>>({
		endpoint: `data/wow/leaderboard/hall-of-fame/${raid}/${faction}`,
		namespace: 'dynamic',
		zod: MythicRaidLeaderboardResponse,
	})
}
