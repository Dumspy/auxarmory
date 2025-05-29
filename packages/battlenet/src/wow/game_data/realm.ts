import type { WoWGameDataClient } from "..";

export function RealmIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/realm/index`,
		namespace: "dynamic",
	});
}

export function Realm(this: WoWGameDataClient, slug: string) {
	return this.request({
		endpoint: `data/wow/realm/${slug}`,
		namespace: "dynamic",
	});
}

export function RealmSearch(this: WoWGameDataClient) {
	// TODO:
	return this.request({
		endpoint: `data/wow/search/realm`,
		namespace: "dynamic",
	});
}
