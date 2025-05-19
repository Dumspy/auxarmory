import { WoWClient } from "..";

export function MyhticKeystoneAffixesIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/keystone-affix/index`,
		namespace: "static",
	});
}

export function MyhticKeystoneAffix(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/keystone-affix/${id}`,
		namespace: "static",
	});
}

export function MyhticKeystoneAffixMedia(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/keystone-affix/${id}`,
		namespace: "static",
	});
}
