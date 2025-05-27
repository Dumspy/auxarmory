import { WoWGameDataClient } from "..";

export function MyhticKeystoneAffixesIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/keystone-affix/index`,
		namespace: "static",
	});
}

export function MyhticKeystoneAffix(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/keystone-affix/${id}`,
		namespace: "static",
	});
}

export function MyhticKeystoneAffixMedia(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/keystone-affix/${id}`,
		namespace: "static",
	});
}
