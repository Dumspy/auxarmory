import { WoWGameDataClient } from "..";

export function PvPTierIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/pvp-tier/index`,
		namespace: "static",
	});
}

export function PvPTier(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/pvp-tier/${id}`,
		namespace: "static",
	});
}

export function PvPTierMedia(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/pvp-tier/${id}`,
		namespace: "static",
	});
}
