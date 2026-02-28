import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
	LocaleString,
} from '../../types'

export const RealmIndexResponse = LinkSelfResponse.extend({
	realms: z.array(
		KeyNameIdResponse.extend({
			slug: z.string(),
		}),
	),
})
export function RealmIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof RealmIndexResponse>>({
		endpoint: `data/wow/realm/index`,
		namespace: 'dynamic',
		zod: RealmIndexResponse,
	})
}

export const RealmResponse = LinkSelfResponse.extend({
	id: z.number(),
	region: KeyNameIdResponse,
	connected_realm: KeyResponse,
	name: LocaleResponse,
	category: LocaleResponse,
	locale: LocaleString,
	timezone: z.enum([
		'America/Los_Angeles',
		'America/New_York',
		'America/Denver',
		'America/Chicago',
		'America/Sao_Paulo',
		'Australia/Melbourne',
		'Europe/Paris',
		'Asia/Seoul',
	]),
	type: z.strictObject({
		type: z.enum(['NORMAL', 'RP']),
		name: LocaleResponse,
	}),
	is_tournament: z.boolean(),
	slug: z.string(),
})
export function Realm(this: WoWGameDataClient, slug: string) {
	return this.request<z.infer<typeof RealmResponse>>({
		endpoint: `data/wow/realm/${slug}`,
		namespace: 'dynamic',
		zod: RealmResponse,
	})
}

export function RealmSearch(this: WoWGameDataClient, params: URLSearchParams) {
	return this.request<unknown>({
		endpoint: `data/wow/search/realm`,
		namespace: 'dynamic',
		zod: z.unknown(),
		params,
	})
}
