import { z } from "zod/v4";

import { WoWGameDataClient } from "..";
import {
	KeyIdResponse,
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
	NameIdResponse,
} from "../../types";

export const MythicKeystoneIndexResponse = LinkSelfResponse.extend({
	seasons: KeyResponse,
	dungeons: KeyResponse,
});
export function MythicKeystoneIndex(
	this: WoWGameDataClient,
): Promise<z.infer<typeof MythicKeystoneIndexResponse>> {
	return this.request({
		endpoint: `data/wow/mythic-keystone/index`,
		namespace: "dynamic",
	});
}

export const MythicKeystoneDungeonIndexResponse = LinkSelfResponse.extend({
	dungeons: z.array(KeyNameIdResponse),
});
export function MythicKeystoneDungeonIndex(
	this: WoWGameDataClient,
): Promise<z.infer<typeof MythicKeystoneDungeonIndexResponse>> {
	return this.request({
		endpoint: `data/wow/mythic-keystone/dungeon/index`,
		namespace: "dynamic",
	});
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
});
export function MythicKeystoneDungeon(
	this: WoWGameDataClient,
	id: number,
): Promise<z.infer<typeof MythicKeystoneDungeonResponse>> {
	return this.request({
		endpoint: `data/wow/mythic-keystone/dungeon/${id}`,
		namespace: "dynamic",
	});
}

export const MythicKeystonePeriodIndexResponse = LinkSelfResponse.extend({
	periods: z.array(KeyIdResponse),
	current_period: KeyIdResponse,
});
export function MythicKeystonePeriodIndex(
	this: WoWGameDataClient,
): Promise<z.infer<typeof MythicKeystonePeriodIndexResponse>> {
	return this.request({
		endpoint: `data/wow/mythic-keystone/period/index`,
		namespace: "dynamic",
	});
}

export const MythicKeystonePeriodResponse = LinkSelfResponse.extend({
	id: z.number(),
	start_timestamp: z.number(),
	end_timestamp: z.number(),
});
export function MythicKeystonePeriod(
	this: WoWGameDataClient,
	id: number,
): Promise<z.infer<typeof MythicKeystonePeriodResponse>> {
	return this.request({
		endpoint: `data/wow/mythic-keystone/period/${id}`,
		namespace: "dynamic",
	});
}

export const MythicKeystoneSeasonIndexResponse = LinkSelfResponse.extend({
	seasons: z.array(KeyIdResponse),
	current_season: KeyIdResponse,
});

export function MythicKeystoneSeasonIndex(
	this: WoWGameDataClient,
): Promise<z.infer<typeof MythicKeystoneSeasonIndexResponse>> {
	return this.request({
		endpoint: `data/wow/mythic-keystone/season/index`,
		namespace: "dynamic",
	});
}

export const MythicKeystoneSeasonResponse = LinkSelfResponse.extend({
	id: z.number(),
	start_timestamp: z.number(),
	end_timestamp: z.number().optional(),
	periods: z.array(KeyIdResponse),
	season_name: LocaleResponse,
});
export function MythicKeystoneSeason(
	this: WoWGameDataClient,
	id: number,
): Promise<z.infer<typeof MythicKeystoneSeasonResponse>> {
	return this.request({
		endpoint: `data/wow/mythic-keystone/season/${id}`,
		namespace: "dynamic",
	});
}
