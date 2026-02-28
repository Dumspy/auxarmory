import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'

export function ModifiedCraftingIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/modified-crafting/index`,
		namespace: 'static',
		zod: z.unknown(),
	})
}

export function ModifiedCraftingCategoryIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/modified-crafting/category/index`,
		namespace: 'static',
		zod: z.unknown(),
	})
}

export function ModifiedCraftingCategory(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/modified-crafting/category/${id}`,
		namespace: 'static',
		zod: z.unknown(),
	})
}

export function ModifiedCraftingReagentSlotTypeIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/modified-crafting/reagent-slot-type/index`,
		namespace: 'static',
		zod: z.unknown(),
	})
}

export function ModifiedCraftingReagentSlotType(
	this: WoWGameDataClient,
	id: number,
) {
	return this.request<unknown>({
		endpoint: `data/wow/modified-crafting/reagent-slot-type/${id}`,
		namespace: 'static',
		zod: z.unknown(),
	})
}
