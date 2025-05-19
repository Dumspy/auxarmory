import { WoWClient } from "..";

export function TechTalentTreeIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/tech-talent-tree/index`,
		namespace: "static",
	});
}

export function TechTalentTree(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/tech-talent-tree/${id}`,
		namespace: "static",
	});
}

export function TechTalentIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/tech-talent/index`,
		namespace: "static",
	});
}

export function TechTalent(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/tech-talent/${id}`,
		namespace: "static",
	});
}

export function TechTalentMedia(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/tech-talent/${id}`,
		namespace: "static",
	});
}
