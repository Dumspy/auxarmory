import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyIdResponse,
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types'
import { Faction } from '../types'

export const ReputationFactionIndexResponse = LinkSelfResponse.extend({
	factions: z.array(KeyNameIdResponse),
	root_factions: z.array(KeyNameIdResponse),
})
export function ReputationFactionIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof ReputationFactionIndexResponse>>({
		endpoint: `data/wow/reputation-faction/index`,
		namespace: 'static',
		zod: ReputationFactionIndexResponse,
	})
}

export const ReputationFactionResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	description: LocaleResponse.optional(),
	reputation_tiers: z.union([KeyIdResponse, KeyNameIdResponse]).optional(),
	factions: z.array(KeyNameIdResponse).optional(),
	player_faction: Faction.optional(),
	is_header: z.boolean().optional(),
	header_shows_bar: z.boolean().optional(),
	can_paragon: z.boolean().optional(),
	is_renown: z.boolean().optional(),
	renown_tiers: z
		.array(
			z.strictObject({
				level: z.number(),
				name: LocaleResponse,
				rewards: z.array(KeyNameIdResponse),
			}),
		)
		.optional(),
})
export function ReputationFaction(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof ReputationFactionResponse>>({
		endpoint: `data/wow/reputation-faction/${id}`,
		namespace: 'static',
		zod: ReputationFactionResponse,
	})
}

export const ReputationTiersIndexResponse = LinkSelfResponse.extend({
	reputation_tiers: z.array(z.union([KeyIdResponse, KeyNameIdResponse])),
})
export function ReputationTiersIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof ReputationTiersIndexResponse>>({
		endpoint: `data/wow/reputation-tiers/index`,
		namespace: 'static',
		zod: ReputationTiersIndexResponse,
	})
}

export const ReputationTiersResponse = LinkSelfResponse.extend({
	id: z.number(),
	tiers: z.array(
		z.strictObject({
			name: LocaleResponse,
			min_value: z.number(),
			max_value: z.number(),
			id: z.number(),
		}),
	),
	faction: KeyNameIdResponse.optional(),
})
export function ReputationTiers(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof ReputationTiersResponse>>({
		endpoint: `data/wow/reputation-tiers/${id}`,
		namespace: 'static',
		zod: ReputationTiersResponse,
	})
}
