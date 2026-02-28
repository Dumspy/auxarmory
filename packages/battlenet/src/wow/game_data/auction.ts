import { z } from 'zod/v4';

import type { WoWGameDataClient } from '..';
import { KeyResponse, LinkSelfResponse } from '../../types';

const Timeleft = z.enum(['SHORT', 'MEDIUM', 'LONG', 'VERY_LONG']);

export const AuctionsResponse = LinkSelfResponse.extend({
	connected_realm: KeyResponse,
	auctions: z.array(
		z.strictObject({
			id: z.number(),
			item: z.strictObject({
				id: z.number(),
				context: z.number().optional(),
				bonus_lists: z.array(z.number()).optional(),
				modifiers: z
					.array(
						z.strictObject({
							type: z.number(),
							value: z.number(),
						}),
					)
					.optional(),
				pet_breed_id: z.number().optional(),
				pet_level: z.number().optional(),
				pet_quality_id: z.number().optional(),
				pet_species_id: z.number().optional(),
			}),
			bid: z.number().optional(),
			buyout: z.number().optional(),
			quantity: z.number().optional(),
			time_left: Timeleft,
		}),
	),
	commodities: KeyResponse,
});
export function Auctions(this: WoWGameDataClient, realm: number) {
	return this.request<z.infer<typeof AuctionsResponse>>({
		endpoint: `data/wow/connected-realm/${realm}/auctions`,
		namespace: 'dynamic',
		zod: AuctionsResponse,
	});
}

export const AuctionCommoditiesResponse = LinkSelfResponse.extend({
	auctions: z.array(
		z.strictObject({
			id: z.number(),
			item: z.strictObject({
				id: z.number(),
			}),
			quantity: z.number(),
			unit_price: z.number(),
			time_left: Timeleft,
		}),
	),
});
export function AuctionCommodities(this: WoWGameDataClient) {
	return this.request<z.infer<typeof AuctionCommoditiesResponse>>({
		endpoint: `data/wow/auctions/commodities`,
		namespace: 'dynamic',
		zod: AuctionCommoditiesResponse,
	});
}
