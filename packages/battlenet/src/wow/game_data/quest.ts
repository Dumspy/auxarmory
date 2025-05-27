import { WoWGameDataClient } from "..";

export function QuestIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/quest/index`,
		namespace: "static",
	});
}

export function Quest(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/quest/${id}`,
		namespace: "static",
	});
}

export function QuestCategoriesIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/quest/category/index`,
		namespace: "static",
	});
}

export function QuestCategory(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/quest/category/${id}`,
		namespace: "static",
	});
}

export function QuestAreasIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/quest/area/index`,
		namespace: "static",
	});
}

export function QuestArea(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/quest/area/${id}`,
		namespace: "static",
	});
}

export function QuestTypeIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/quest/type/index`,
		namespace: "static",
	});
}

export function QuestType(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/quest/type/${id}`,
		namespace: "static",
	});
}
