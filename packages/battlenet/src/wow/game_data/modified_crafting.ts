import { WoWClient } from "..";

export function ModifiedCraftingIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/modified-crafting/index`,
		namespace: "static",
	});
}

export function ModifiedCraftingCategoryIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/modified-crafting/category/index`,
		namespace: "static",
	});
}

export function ModifiedCraftingCategory(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/modified-crafting/category/${id}`,
		namespace: "static",
	});
}

export function ModifiedCraftingReagentSlotTypeIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/modified-crafting/reagent-slot-type/index`,
		namespace: "static",
	});
}

export function ModifiedCraftingReagentSlotType(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/modified-crafting/reagent-slot-type/${id}`,
		namespace: "static",
	});
}
