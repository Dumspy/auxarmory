import { WoWClient } from "..";

export function RealmIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/realm/index`,
		namespace: "dynamic",
	});
}

export function Realm(this: WoWClient, slug: string) {
	return this.request({
		endpoint: `data/wow/realm/${slug}`,
		namespace: "dynamic",
	});
}

export function RealmSearch(this: WoWClient) {
	// TODO:
	return this.request({
		endpoint: `data/wow/search/realm`,
		namespace: "dynamic",
	});
}
