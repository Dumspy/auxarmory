import { WoWGameDataClient } from "..";

export function ItemAppearance(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/item-appearance/${id}`,
		namespace: "static",
	});
}

export function ItemAppearanceSearch(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/search/item-appearance`,
		namespace: "static",
	});
}

export function ItemAppearanceSetIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/item-appearance/set/index`,
		namespace: "static",
	});
}

export function ItemAppearanceSet(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/item-appearance/set/${id}`,
		namespace: "static",
	});
}

export function ItemAppearanceSlotIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/item-appearance/slot/index`,
		namespace: "static",
	});
}

export function ItemAppearanceSlot(this: WoWGameDataClient, slotType: string) {
	return this.request({
		endpoint: `data/wow/item-appearance/slot/${slotType}`,
		namespace: "static",
	});
}
