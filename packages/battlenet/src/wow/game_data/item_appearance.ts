import { WoWClient } from "..";

export function ItemAppearance(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/item-appearance/${id}`,
		namespace: "static",
	});
}

export function ItemAppearanceSearch(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/search/item-appearance`,
		namespace: "static",
	});
}

export function ItemAppearanceSetIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/item-appearance/set/index`,
		namespace: "static",
	});
}

export function ItemAppearanceSet(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/item-appearance/set/${id}`,
		namespace: "static",
	});
}

export function ItemAppearanceSlotIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/item-appearance/slot/index`,
		namespace: "static",
	});
}

export function ItemAppearanceSlot(this: WoWClient, slotType: string) {
	return this.request({
		endpoint: `data/wow/item-appearance/slot/${slotType}`,
		namespace: "static",
	});
}
