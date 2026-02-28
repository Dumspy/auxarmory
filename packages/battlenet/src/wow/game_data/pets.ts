import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaAssetArray,
	MediaKeyResponse,
} from '../../types'

export const PetIndexResponse = LinkSelfResponse.extend({
	pets: z.array(KeyNameIdResponse),
})
export function PetIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof PetIndexResponse>>({
		endpoint: `data/wow/pet/index`,
		namespace: 'static',
		zod: PetIndexResponse,
	})
}

const BattlePetType = z.strictObject({
	id: z.number(),
	type: z.enum([
		'HUMANOID',
		'BEAST',
		'MAGIC',
		'ELEMENTAL',
		'MECHANICAL',
		'DRAGONKIN',
		'CRITTER',
		'FLYING',
		'AQUATIC',
		'UNDEAD',
	]),
	name: LocaleResponse,
})

export const PetResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	battle_pet_type: BattlePetType,
	description: LocaleResponse,
	is_capturable: z.boolean(),
	is_tradable: z.boolean(),
	is_battlepet: z.boolean(),
	is_alliance_only: z.boolean(),
	is_horde_only: z.boolean(),
	abilities: z
		.array(
			z.strictObject({
				ability: KeyNameIdResponse,
				slot: z.number(),
				required_level: z.number(),
			}),
		)
		.optional(),
	source: z
		.strictObject({
			type: z.enum([
				'VENDOR',
				'WILDPET',
				'WORLDEVENT',
				'PROFESSION',
				'PROMOTION',
				'QUEST',
				'DROP',
				'TCG',
				'ACHIEVEMENT',
				'PETSTORE',
				'TRADINGPOST',
				'DISCOVERY',
			]),
			name: LocaleResponse,
		})
		.optional(),
	icon: z.url(),
	creature: KeyNameIdResponse,
	is_random_creature_display: z.boolean(),
	media: MediaKeyResponse,
	should_exclude_if_uncollected: z.boolean().optional(),
})
export function Pet(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof PetResponse>>({
		endpoint: `data/wow/pet/${id}`,
		namespace: 'static',
		zod: PetResponse,
	})
}

export const PetMediaResponse = LinkSelfResponse.extend({
	assets: MediaAssetArray,
	id: z.number(),
})
export function PetMedia(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof PetMediaResponse>>({
		endpoint: `data/wow/media/pet/${id}`,
		namespace: 'static',
		zod: PetMediaResponse,
	})
}

export const PetAbilitiesIndexResponse = LinkSelfResponse.extend({
	abilities: z.array(KeyNameIdResponse),
})
export function PetAbilitiesIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof PetAbilitiesIndexResponse>>({
		endpoint: `data/wow/pet-ability/index`,
		namespace: 'static',
		zod: PetAbilitiesIndexResponse,
	})
}

export const PetAbilityResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	battle_pet_type: BattlePetType,
	cooldown: z.number().optional(),
	rounds: z.number(),
	media: MediaKeyResponse,
})
export function PetAbility(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof PetAbilityResponse>>({
		endpoint: `data/wow/pet-ability/${id}`,
		namespace: 'static',
		zod: PetAbilityResponse,
	})
}

export const PetAbilityMediaResponse = LinkSelfResponse.extend({
	assets: MediaAssetArray,
	id: z.number(),
})
export function PetAbilityMedia(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/media/pet-ability/${id}`,
		namespace: 'static',
		zod: z.unknown(),
	})
}
