import { WoWClient } from "..";

export function PowerTypeIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/power-type/index`,
		namespace: "static",
	});
}

export function PowerType(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/power-type/${id}`,
		namespace: "static",
	});
}
