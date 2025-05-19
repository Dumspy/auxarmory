import { WoWClient } from "..";

export function QuestIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/quest/index`,
		namespace: "static",
	});
}

export function Quest(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/quest/${id}`,
		namespace: "static",
	});
}

export function QuestCategoriesIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/quest/category/index`,
		namespace: "static",
	});
}

export function QuestCategory(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/quest/category/${id}`,
		namespace: "static",
	});
}

export function QuestAreasIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/quest/area/index`,
		namespace: "static",
	});
}

export function QuestArea(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/quest/area/${id}`,
		namespace: "static",
	});
}

export function QuestTypeIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/quest/type/index`,
		namespace: "static",
	});
}

export function QuestType(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/quest/type/${id}`,
		namespace: "static",
	});
}
