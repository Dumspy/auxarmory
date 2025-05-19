import { WoWClient } from "..";

export function ConnectedRealmIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/connected-realm/index`,
		namespace: "dynamic",
	});
}

export function ConnectedRealm(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/connected-realm/${id}`,
		namespace: "dynamic",
	});
}

export function ConnectedRealmSearch(this: WoWClient, status: "UP" | "DOWN") {
	// TODO: Do correctly
	return this.request({
		endpoint: `data/wow/search/connected-realm`,
		namespace: "dynamic",
	});
}
