import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import {
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaAssetArray,
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
	description: LocaleResponse.optional(),
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

export function ItemSearch(this: WoWGameDataClient, params: URLSearchParams) {
	return this.request<unknown>({
		endpoint: `data/wow/search/item`,
		namespace: "static",
		zod: z.unknown(),
		params,
	});
}

export const ItemMediaResponse = LinkSelfResponse.extend({
	assets: MediaAssetArray,
	id: z.number(),
});
export function ItemMedia(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof ItemMediaResponse>>({
		endpoint: `data/wow/media/item/${id}`,
		namespace: "static",
		zod: ItemMediaResponse,
	});
}

export const ItemClassIndexResponse = LinkSelfResponse.extend({
	item_classes: z.array(KeyNameIdResponse),
});
export function ItemClassIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof ItemClassIndexResponse>>({
		endpoint: `data/wow/item-class/index`,
		namespace: "static",
		zod: ItemClassIndexResponse,
	});
}

export const ItemClassResponse = LinkSelfResponse.extend({
	class_id: z.number(),
	name: LocaleResponse,
	item_subclasses: z.array(KeyNameIdResponse),
});
export function ItemClass(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof ItemClassResponse>>({
		endpoint: `data/wow/item-class/${id}`,
		namespace: "static",
		zod: ItemClassResponse,
	});
}

export const ItemSetIndexResponse = LinkSelfResponse.extend({
	item_sets: z.array(KeyNameIdResponse),
});
export function ItemSetIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof ItemSetIndexResponse>>({
		endpoint: `data/wow/item-set/index`,
		namespace: "static",
		zod: ItemSetIndexResponse,
	});
}

export const ItemSetResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	items: z.array(KeyNameIdResponse),
	effects: z.array(
		z.strictObject({
			display_string: LocaleResponse,
			required_count: z.number(),
		}),
	),
	is_effect_active: z.boolean().optional(),
});
export function ItemSet(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof ItemSetResponse>>({
		endpoint: `data/wow/item-set/${id}`,
		namespace: "static",
		zod: ItemSetResponse,
	});
}

export const ItemSubClassResponse = LinkSelfResponse.extend({
	class_id: z.number(),
	subclass_id: z.number(),
	display_name: LocaleResponse,
	verbose_name: LocaleResponse.optional(),
	hide_subclass_in_tooltips: z.boolean().optional(),
});
export function ItemSubClass(
	this: WoWGameDataClient,
	itemClassId: number,
	itemSubClassId: number,
) {
	return this.request<z.infer<typeof ItemSubClassResponse>>({
		endpoint: `data/wow/item-class/${itemClassId}/item-subclass/${itemSubClassId}`,
		namespace: "static",
		zod: ItemSubClassResponse,
	});
}
