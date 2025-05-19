import { WoWClient } from "..";

export function MyhticKeystoneIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/mythic-keystone/index`,
		namespace: "dynamic",
	});
}

export function MythicKeystoneDungeonIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/mythic-keystone/dungeon/index`,
		namespace: "dynamic",
	});
}

export function MythicKeystoneDungeon(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/mythic-keystone/dungeon/${id}`,
		namespace: "dynamic",
	});
}

export function MythicKeystonePeriodIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/mythic-keystone/period/index`,
		namespace: "dynamic",
	});
}

export function MythicKeystonePeriod(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/mythic-keystone/period/${id}`,
		namespace: "dynamic",
	});
}

export function MyhticKeystoneSeasonIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/mythic-keystone/season/index`,
		namespace: "dynamic",
	});
}

export function MyhticKeystoneSeason(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/mythic-keystone/season/${id}`,
		namespace: "dynamic",
	});
}
