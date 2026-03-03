import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'

export function MediaSearch(this: WoWGameDataClient, params: URLSearchParams) {
	return this.request<unknown>({
		endpoint: `data/wow/search/media`,
		namespace: 'static',
		zod: z.unknown(),
		params,
	})
}
