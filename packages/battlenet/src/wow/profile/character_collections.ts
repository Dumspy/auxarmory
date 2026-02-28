import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyIdResponse,
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types'
import { CharacterResponse } from '../types/character'
import { ItemIventoryType } from '../types/item'

export const CharacterCollectionIndexResponse = LinkSelfResponse.extend({
	pets: KeyResponse,
	mounts: KeyResponse,
	heirlooms: KeyResponse,
	toys: KeyResponse,
	character: CharacterResponse,
	transmogs: KeyResponse,
})
export function CharacterCollectionIndex(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterCollectionIndexResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/collections`,
		namespace: 'profile',
		zod: CharacterCollectionIndexResponse,
	})
}

export const CharacterHeirloomsCollectionSummaryResponse =
	LinkSelfResponse.extend({
		heirlooms: z.array(
			z.strictObject({
				heirloom: KeyNameIdResponse,
				upgrade: z.strictObject({
					level: z.number(),
				}),
			}),
		),
	})
export function CharacterHeirloomsCollectionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<
		z.infer<typeof CharacterHeirloomsCollectionSummaryResponse>
	>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/collections/heirlooms`,
		namespace: 'profile',
		zod: CharacterHeirloomsCollectionSummaryResponse,
	})
}

export const CharacterMountsCollectionSummaryResponse = LinkSelfResponse.extend(
	{
		mounts: z.array(
			z.strictObject({
				mount: KeyNameIdResponse,
				is_useable: z.boolean(),
				is_favorite: z.boolean().optional(),
				is_character_specific: z.boolean().optional(),
			}),
		),
	},
)
export function CharacterMountsCollectionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<
		z.infer<typeof CharacterMountsCollectionSummaryResponse>
	>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/collections/mounts`,
		namespace: 'profile',
		zod: CharacterMountsCollectionSummaryResponse,
	})
}

export const CharacterPetsCollectionSummaryResponse = LinkSelfResponse.extend({
	pets: z.array(
		z.strictObject({
			species: KeyNameIdResponse,
			level: z.number(),
			quality: z.strictObject({
				type: z.enum(['POOR', 'COMMON', 'UNCOMMON', 'RARE']),
				name: LocaleResponse,
			}),
			stats: z.strictObject({
				breed_id: z.number(),
				health: z.number(),
				power: z.number(),
				speed: z.number(),
			}),
			is_favorite: z.boolean().optional(),
			is_active: z.boolean().optional(),
			active_slot: z.number().optional(),
			creature_display: KeyIdResponse.optional(),
			id: z.number(),
			name: z.string().optional(),
		}),
	),
	unlocked_battle_pet_slots: z.number(),
})
export function CharacterPetsCollectionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterPetsCollectionSummaryResponse>>(
		{
			endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/collections/pets`,
			namespace: 'profile',
			zod: CharacterPetsCollectionSummaryResponse,
		},
	)
}

export const CharacterToysCollectionSummaryResponse = LinkSelfResponse.extend({
	toys: z.array(
		z.strictObject({
			toy: KeyNameIdResponse,
			is_favorite: z.boolean().optional(),
		}),
	),
})
export function CharacterToysCollectionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterToysCollectionSummaryResponse>>(
		{
			endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/collections/toys`,
			namespace: 'profile',
			zod: CharacterToysCollectionSummaryResponse,
		},
	)
}

export const CharacterTransmogCollectionSummaryResponse =
	LinkSelfResponse.extend({
		appearance_sets: z.array(KeyNameIdResponse),
		slots: z.array(
			z.strictObject({
				slot: ItemIventoryType,
				appearances: z.array(KeyIdResponse),
			}),
		),
	})
export function CharacterTransmogCollectionSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<
		z.infer<typeof CharacterTransmogCollectionSummaryResponse>
	>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/collections/transmogs`,
		namespace: 'profile',
		zod: CharacterTransmogCollectionSummaryResponse,
	})
}
