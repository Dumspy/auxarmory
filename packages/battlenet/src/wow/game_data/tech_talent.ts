import { WoWGameDataClient } from "..";

export function TechTalentTreeIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/tech-talent-tree/index`,
		namespace: "static",
	});
}

export function TechTalentTree(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/tech-talent-tree/${id}`,
		namespace: "static",
	});
}

export function TechTalentIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/tech-talent/index`,
		namespace: "static",
	});
}

export function TechTalent(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/tech-talent/${id}`,
		namespace: "static",
	});
}

export function TechTalentMedia(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/tech-talent/${id}`,
		namespace: "static",
	});
}
