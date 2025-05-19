import { WoWClient } from "..";

export function TalentTreeIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/talent-tree/index`,
		namespace: "static",
	});
}

export function TalentTree(
	this: WoWClient,
	talentTreeId: number,
	specId: number,
) {
	return this.request({
		endpoint: `data/wow/talent-tree/${talentTreeId}/playable-specialization/${specId}`,
		namespace: "static",
	});
}

export function TalentTreeNodes(this: WoWClient, talentTreeId: number) {
	return this.request({
		endpoint: `data/wow/talent-tree/${talentTreeId}`,
		namespace: "static",
	});
}

export function TalentIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/talent/index`,
		namespace: "static",
	});
}

export function Talent(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/talent/${id}`,
		namespace: "static",
	});
}

export function PvPTalentIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/pvp-talent/index`,
		namespace: "static",
	});
}

export function PvPTalent(this: WoWClient, pvpTalentId: number) {
	return this.request({
		endpoint: `data/wow/pvp-talent/${pvpTalentId}`,
		namespace: "static",
	});
}
