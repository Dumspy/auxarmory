import { WoWClient } from "..";

export function ReputationFactionIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/reputation-faction/index`,
		namespace: "static",
	});
}

export function ReputationFaction(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/reputation-faction/${id}`,
		namespace: "static",
	});
}

export function ReputationTiersIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/reputation-tiers/index`,
		namespace: "static",
	});
}

export function ReputationTiers(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/reputation-tiers/${id}`,
		namespace: "static",
	});
}
