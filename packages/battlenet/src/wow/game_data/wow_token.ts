import { z } from 'zod/v4';

import type { WoWGameDataClient } from '..';
import { LinkSelfResponse } from '../../types';

export const WoWTokenResponse = LinkSelfResponse.extend({
	last_updated_timestamp: z.number(),
	price: z.number(),
});
export function WoWTokenIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof WoWTokenResponse>>({
		endpoint: `data/wow/token/index`,
		namespace: 'dynamic',
		zod: WoWTokenResponse,
	});
}
