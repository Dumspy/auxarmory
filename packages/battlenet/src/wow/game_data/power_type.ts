import { WoWGameDataClient } from "..";

export function PowerTypeIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/power-type/index`,
		namespace: "static",
	});
}

export function PowerType(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/power-type/${id}`,
		namespace: "static",
	});
}
