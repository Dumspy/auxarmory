import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'

export function ItemAppearance(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/item-appearance/${id}`,
		namespace: 'static',
		zod: z.unknown(),
	})
}

export function ItemAppearanceSearch(
	this: WoWGameDataClient,
	params: URLSearchParams,
) {
	return this.request<unknown>({
		endpoint: `data/wow/search/item-appearance`,
		namespace: 'static',
		zod: z.unknown(),
		params,
	})
}

export function ItemAppearanceSetIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/item-appearance/set/index`,
		namespace: 'static',
		zod: z.unknown(),
	})
}

export function ItemAppearanceSet(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/item-appearance/set/${id}`,
		namespace: 'static',
		zod: z.unknown(),
	})
}

export function ItemAppearanceSlotIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/item-appearance/slot/index`,
		namespace: 'static',
		zod: z.unknown(),
	})
}

export function ItemAppearanceSlot(this: WoWGameDataClient, slotType: string) {
	return this.request<unknown>({
		endpoint: `data/wow/item-appearance/slot/${slotType}`,
		namespace: 'static',
		zod: z.unknown(),
	})
}
