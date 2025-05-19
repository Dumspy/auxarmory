import { WoWClient } from "..";

export function Item(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/item/${id}`,
		namespace: "static",
	});
}

export function ItemSearch(this: WoWClient) {
	// TODO:
	return this.request({
		endpoint: `data/wow/search/item`,
		namespace: "static",
	});
}

export function ItemMedia(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/item/${id}`,
		namespace: "static",
	});
}

export function ItemClassIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/item-class/index`,
		namespace: "static",
	});
}

export function ItemClass(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/item-class/${id}`,
		namespace: "static",
	});
}

export function ItemSetIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/item-set/index`,
		namespace: "static",
	});
}

export function ItemSet(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/item-set/${id}`,
		namespace: "static",
	});
}

export function ItemSubClass(
	this: WoWClient,
	itemClassId: number,
	itemSubClassId: number,
) {
	return this.request({
		endpoint: `data/wow/item-class/${itemClassId}/item-subclass/${itemSubClassId}`,
		namespace: "static",
	});
}
