import { z } from 'zod/v4';

import type { WoWGameDataClient } from '..';
import {
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaKeyResponse,
} from '../../types';

export const ToyIndexResponse = LinkSelfResponse.extend({
	toys: z.array(KeyNameIdResponse),
});
export function ToyIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof ToyIndexResponse>>({
		endpoint: `data/wow/toy/index`,
		namespace: 'static',
		zod: ToyIndexResponse,
	});
}

export const ToyResponse = LinkSelfResponse.extend({
	id: z.number(),
	item: KeyNameIdResponse,
	source: z.strictObject({
		type: z.enum([
			'PROMOTION',
			'VENDOR',
			'QUEST',
			'DROP',
			'PROFESSION',
			'WORLDEVENT',
			'ACHIEVEMENT',
			'OTHER',
			'WILDPET',
			'PETSTORE',
			'TRADINGPOST',
			'DISCOVERY',
		]),
		name: LocaleResponse,
	}),
	source_description: LocaleResponse.optional(),
	should_exclude_if_uncollected: z.boolean().optional(),
	media: MediaKeyResponse,
});
export function Toy(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof ToyResponse>>({
		endpoint: `data/wow/toy/${id}`,
		namespace: 'static',
		zod: ToyResponse,
	});
}
