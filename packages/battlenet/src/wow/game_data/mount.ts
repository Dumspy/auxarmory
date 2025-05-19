import { WoWClient } from "..";

export function MountIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/mount/index`,
		namespace: "static",
	});
}

export function Mount(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/mount/${id}`,
		namespace: "static",
	});
}

export function MountSearch(this: WoWClient) {
	// TODO:
	return this.request({
		endpoint: `data/wow/mount/search`,
		namespace: "static",
	});
}
