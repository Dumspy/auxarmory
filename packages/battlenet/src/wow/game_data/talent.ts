import { WoWGameDataClient } from "..";

export function TalentTreeIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/talent-tree/index`,
		namespace: "static",
	});
}

export function TalentTree(
	this: WoWGameDataClient,
	talentTreeId: number,
	specId: number,
) {
	return this.request({
		endpoint: `data/wow/talent-tree/${talentTreeId}/playable-specialization/${specId}`,
		namespace: "static",
	});
}

export function TalentTreeNodes(this: WoWGameDataClient, talentTreeId: number) {
	return this.request({
		endpoint: `data/wow/talent-tree/${talentTreeId}`,
		namespace: "static",
	});
}

export function TalentIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/talent/index`,
		namespace: "static",
	});
}

export function Talent(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/talent/${id}`,
		namespace: "static",
	});
}

export function PvPTalentIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/pvp-talent/index`,
		namespace: "static",
	});
}

export function PvPTalent(this: WoWGameDataClient, pvpTalentId: number) {
	return this.request({
		endpoint: `data/wow/pvp-talent/${pvpTalentId}`,
		namespace: "static",
	});
}
