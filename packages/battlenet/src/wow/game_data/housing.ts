import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types'

export const HousingDecorIndexResponse = LinkSelfResponse.extend({
	decor_items: z.array(KeyNameIdResponse),
})
export function HousingDecorIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof HousingDecorIndexResponse>>({
		endpoint: `data/wow/decor/index`,
		namespace: 'static',
		zod: HousingDecorIndexResponse,
	})
}

export const HousingDecorResponse = LinkSelfResponse.extend({
	id: z.number(),
	items: KeyNameIdResponse,
	name: LocaleResponse,
	source: z
		.array(
			z.object({
				recipes: z.array(KeyNameIdResponse).optional(),
				achievements: z.array(KeyNameIdResponse).optional(),
			}),
		)
		.optional(),
	dye_slots: z
		.array(
			z.object({
				slot_index: z.number(),
				dye_color_category: LocaleResponse,
			}),
		)
		.optional(),
})
export function HousingDecor(
	this: WoWGameDataClient,
	decorId: number | string,
) {
	return this.request<z.infer<typeof HousingDecorResponse>>({
		endpoint: `data/wow/decor/${decorId}`,
		namespace: 'static',
		zod: HousingDecorResponse,
	})
}

export const HousingDecorSearchResponse = z.unknown()
export function HousingDecorSearch(
	this: WoWGameDataClient,
	params: URLSearchParams,
) {
	return this.request<z.infer<typeof HousingDecorSearchResponse>>({
		endpoint: `data/wow/search/decor`,
		namespace: 'static',
		zod: HousingDecorSearchResponse,
		params,
	})
}

export const HousingFixtureIndexResponse = LinkSelfResponse.extend({
	fixtures: z.array(KeyNameIdResponse),
})
export function HousingFixtureIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof HousingFixtureIndexResponse>>({
		endpoint: `data/wow/fixture/index`,
		namespace: 'static',
		zod: HousingFixtureIndexResponse,
	})
}

export const HousingFixtureResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	hooks: z.array(KeyNameIdResponse).optional(),
})
export function HousingFixture(
	this: WoWGameDataClient,
	fixtureId: number | string,
) {
	return this.request<z.infer<typeof HousingFixtureResponse>>({
		endpoint: `data/wow/fixture/${fixtureId}`,
		namespace: 'static',
		zod: HousingFixtureResponse,
	})
}

export const HousingFixtureSearchResponse = z.unknown()
export function HousingFixtureSearch(
	this: WoWGameDataClient,
	params: URLSearchParams,
) {
	return this.request<z.infer<typeof HousingFixtureSearchResponse>>({
		endpoint: `data/wow/search/fixture`,
		namespace: 'static',
		zod: HousingFixtureSearchResponse,
		params,
	})
}

export const HousingFixtureHookIndexResponse = LinkSelfResponse.extend({
	fixture_hooks: z.array(KeyNameIdResponse),
})
export function HousingFixtureHookIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof HousingFixtureHookIndexResponse>>({
		endpoint: `data/wow/fixture-hook/index`,
		namespace: 'static',
		zod: HousingFixtureHookIndexResponse,
	})
}

export const HousingFixtureHookResponse = LinkSelfResponse.extend({
	id: z.number(),
	type_name: LocaleResponse,
	parent_fixture: KeyNameIdResponse,
})
export function HousingFixtureHook(
	this: WoWGameDataClient,
	fixtureHookId: number | string,
) {
	return this.request<z.infer<typeof HousingFixtureHookResponse>>({
		endpoint: `data/wow/fixture-hook/${fixtureHookId}`,
		namespace: 'static',
		zod: HousingFixtureHookResponse,
	})
}

export const HousingFixtureHookSearchResponse = z.unknown()
export function HousingFixtureHookSearch(
	this: WoWGameDataClient,
	params: URLSearchParams,
) {
	return this.request<z.infer<typeof HousingFixtureHookSearchResponse>>({
		endpoint: `data/wow/search/fixture-hook`,
		namespace: 'static',
		zod: HousingFixtureHookSearchResponse,
		params,
	})
}

export const HousingRoomIndexResponse = LinkSelfResponse.extend({
	rooms: z.array(z.union([z.strictObject({}), KeyNameIdResponse])),
})
export function HousingRoomIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof HousingRoomIndexResponse>>({
		endpoint: `data/wow/room/index`,
		namespace: 'static',
		zod: HousingRoomIndexResponse,
	})
}

export const HousingRoomResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
})
export function HousingRoom(this: WoWGameDataClient, roomId: number) {
	return this.request<z.infer<typeof HousingRoomResponse>>({
		endpoint: `data/wow/room/${roomId}`,
		namespace: 'static',
		zod: HousingRoomResponse,
	})
}

export const HousingRoomSearchResponse = z.unknown()
export function HousingRoomSearch(
	this: WoWGameDataClient,
	params: URLSearchParams,
) {
	return this.request<z.infer<typeof HousingRoomSearchResponse>>({
		endpoint: `data/wow/search/room`,
		namespace: 'static',
		zod: HousingRoomSearchResponse,
		params,
	})
}
