import { WoWGameDataClient } from "..";

export function RegionIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/region/index`,
		namespace: "dynamic",
	});
}

export function Region(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/region/${id}`,
		namespace: "dynamic",
	});
}
