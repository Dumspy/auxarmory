import { WoWClient } from "..";

export function RegionIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/region/index`,
		namespace: "dynamic",
	});
}

export function Region(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/region/${id}`,
		namespace: "dynamic",
	});
}
