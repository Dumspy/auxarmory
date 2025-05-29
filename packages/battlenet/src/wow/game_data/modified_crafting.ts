import type { WoWGameDataClient } from "..";

export function ModifiedCraftingIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/modified-crafting/index`,
		namespace: "static",
	});
}

export function ModifiedCraftingCategoryIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/modified-crafting/category/index`,
		namespace: "static",
	});
}

export function ModifiedCraftingCategory(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/modified-crafting/category/${id}`,
		namespace: "static",
	});
}

export function ModifiedCraftingReagentSlotTypeIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/modified-crafting/reagent-slot-type/index`,
		namespace: "static",
	});
}

export function ModifiedCraftingReagentSlotType(
	this: WoWGameDataClient,
	id: number,
) {
	return this.request({
		endpoint: `data/wow/modified-crafting/reagent-slot-type/${id}`,
		namespace: "static",
	});
}
