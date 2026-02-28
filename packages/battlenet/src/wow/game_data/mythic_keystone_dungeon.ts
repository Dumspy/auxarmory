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

export const MythicKeystoneIndexResponse = LinkSelfResponse.extend({
	seasons: KeyResponse,
	dungeons: KeyResponse,
})
export function MythicKeystoneIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof MythicKeystoneIndexResponse>>({
		endpoint: `data/wow/mythic-keystone/index`,
		namespace: 'dynamic',
		zod: MythicKeystoneIndexResponse,
	})
}

export const MythicKeystoneDungeonIndexResponse = LinkSelfResponse.extend({
	dungeons: z.array(KeyNameIdResponse),
})
export function MythicKeystoneDungeonIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof MythicKeystoneDungeonIndexResponse>>({
		endpoint: `data/wow/mythic-keystone/dungeon/index`,
		namespace: 'dynamic',
		zod: MythicKeystoneDungeonIndexResponse,
	})
}

export const MythicKeystoneDungeonResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	map: NameIdResponse,
	zone: z.strictObject({
		slug: z.string(),
	}),
	dungeon: KeyNameIdResponse,
	keystone_upgrades: z.array(
		z.strictObject({
			upgrade_level: z.number(),
			qualifying_duration: z.number(),
		}),
	),
	is_tracked: z.boolean(),
})
export function MythicKeystoneDungeon(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof MythicKeystoneDungeonResponse>>({
		endpoint: `data/wow/mythic-keystone/dungeon/${id}`,
		namespace: 'dynamic',
		zod: MythicKeystoneDungeonResponse,
	})
}

export const MythicKeystonePeriodIndexResponse = LinkSelfResponse.extend({
	periods: z.array(KeyIdResponse),
	current_period: KeyIdResponse,
})
export function MythicKeystonePeriodIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof MythicKeystonePeriodIndexResponse>>({
		endpoint: `data/wow/mythic-keystone/period/index`,
		namespace: 'dynamic',
		zod: MythicKeystonePeriodIndexResponse,
	})
}

export const MythicKeystonePeriodResponse = LinkSelfResponse.extend({
	id: z.number(),
	start_timestamp: z.number(),
	end_timestamp: z.number(),
})
export function MythicKeystonePeriod(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof MythicKeystonePeriodResponse>>({
		endpoint: `data/wow/mythic-keystone/period/${id}`,
		namespace: 'dynamic',
		zod: MythicKeystonePeriodResponse,
	})
}

export const MythicKeystoneSeasonIndexResponse = LinkSelfResponse.extend({
	seasons: z.array(KeyIdResponse),
	current_season: KeyIdResponse,
})

export function MythicKeystoneSeasonIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof MythicKeystoneSeasonIndexResponse>>({
		endpoint: `data/wow/mythic-keystone/season/index`,
		namespace: 'dynamic',
		zod: MythicKeystoneSeasonIndexResponse,
	})
}

export const MythicKeystoneSeasonResponse = LinkSelfResponse.extend({
	id: z.number(),
	start_timestamp: z.number(),
	end_timestamp: z.number().optional(),
	periods: z.array(KeyIdResponse),
	season_name: LocaleResponse,
})
export function MythicKeystoneSeason(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof MythicKeystoneSeasonResponse>>({
		endpoint: `data/wow/mythic-keystone/season/${id}`,
		namespace: 'dynamic',
		zod: MythicKeystoneSeasonResponse,
	})
}
