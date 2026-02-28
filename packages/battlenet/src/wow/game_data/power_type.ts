import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types'

export const PowerTypeIndexResponse = LinkSelfResponse.extend({
	power_types: z.array(KeyNameIdResponse),
})
export function PowerTypeIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof PowerTypeIndexResponse>>({
		endpoint: `data/wow/power-type/index`,
		namespace: 'static',
		zod: PowerTypeIndexResponse,
	})
}

export const PowerTypeResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
})
export function PowerType(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof PowerTypeResponse>>({
		endpoint: `data/wow/power-type/${id}`,
		namespace: 'static',
		zod: PowerTypeResponse,
	})
}
