import { WoWGameDataClient } from "..";

export function MyhticKeystoneIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/mythic-keystone/index`,
		namespace: "dynamic",
	});
}

export function MythicKeystoneDungeonIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/mythic-keystone/dungeon/index`,
		namespace: "dynamic",
	});
}

export function MythicKeystoneDungeon(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/mythic-keystone/dungeon/${id}`,
		namespace: "dynamic",
	});
}

export function MythicKeystonePeriodIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/mythic-keystone/period/index`,
		namespace: "dynamic",
	});
}

export function MythicKeystonePeriod(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/mythic-keystone/period/${id}`,
		namespace: "dynamic",
	});
}

export function MyhticKeystoneSeasonIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/mythic-keystone/season/index`,
		namespace: "dynamic",
	});
}

export function MyhticKeystoneSeason(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/mythic-keystone/season/${id}`,
		namespace: "dynamic",
	});
}
