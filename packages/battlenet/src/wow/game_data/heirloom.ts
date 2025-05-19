import { WoWClient } from "..";

export function HeirloomIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/heirloom/index`,
		namespace: "static",
	});
}

export function Heirloom(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/heirloom/${id}`,
		namespace: "static",
	});
}
