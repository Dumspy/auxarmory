import type { WoWGameDataClient } from "..";

export function ReputationFactionIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/reputation-faction/index`,
		namespace: "static",
	});
}

export function ReputationFaction(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/reputation-faction/${id}`,
		namespace: "static",
	});
}

export function ReputationTiersIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/reputation-tiers/index`,
		namespace: "static",
	});
}

export function ReputationTiers(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/reputation-tiers/${id}`,
		namespace: "static",
	});
}
