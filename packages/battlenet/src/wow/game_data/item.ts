import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import {
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaKeyResponse,
} from "../../types";
import { ItemIventoryType, ItemQuality, PreviewItem } from "../types/item";

export const ItemResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	quality: ItemQuality,
	level: z.number(),
	required_level: z.number(),
	media: MediaKeyResponse,
	item_class: KeyNameIdResponse,
	item_subclass: KeyNameIdResponse,
	inventory_type: ItemIventoryType.optional(),
	purchase_price: z.number(),
	sell_price: z.number(),
	max_count: z.number(),
	is_equippable: z.boolean(),
	is_stackable: z.boolean(),
	preview_item: PreviewItem,
	purchase_quantity: z.number(),
	appearances: z
		.array(
			z.strictObject({
				id: z.number(),
				key: KeyResponse,
			}),
		)
		.optional(),
});
export function Item(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof ItemResponse>>({
		endpoint: `data/wow/item/${id}`,
		namespace: "static",
		zod: ItemResponse,
	});
}

export function ItemSearch(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/search/item`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function ItemMedia(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/media/item/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function ItemClassIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/item-class/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function ItemClass(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/item-class/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function ItemSetIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/item-set/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function ItemSet(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/item-set/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function ItemSubClass(
	this: WoWGameDataClient,
	itemClassId: number,
	itemSubClassId: number,
) {
	return this.request<unknown>({
		endpoint: `data/wow/item-class/${itemClassId}/item-subclass/${itemSubClassId}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
