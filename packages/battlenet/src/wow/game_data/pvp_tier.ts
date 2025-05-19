import { WoWClient } from "..";

export function PvPTierIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/pvp-tier/index`,
		namespace: "static",
	});
}

export function PvPTier(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/pvp-tier/${id}`,
		namespace: "static",
	});
}

export function PvPTierMedia(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/pvp-tier/${id}`,
		namespace: "static",
	});
}
