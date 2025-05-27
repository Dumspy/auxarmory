import { WoWGameDataClient } from "..";

export function MountIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/mount/index`,
		namespace: "static",
	});
}

export function Mount(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/mount/${id}`,
		namespace: "static",
	});
}

export function MountSearch(this: WoWGameDataClient) {
	// TODO:
	return this.request({
		endpoint: `data/wow/mount/search`,
		namespace: "static",
	});
}
