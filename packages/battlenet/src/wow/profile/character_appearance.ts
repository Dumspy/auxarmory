import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types'
import { ColorObject, Faction, Gender } from '../types'
import { CharacterResponse } from '../types/character'
import { ItemIventoryType } from '../types/item'

export const CharacterAppearanceSummaryResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	playable_race: KeyNameIdResponse,
	playable_class: KeyNameIdResponse,
	active_spec: KeyNameIdResponse,
	gender: Gender,
	faction: Faction,
	guild_crest: z
		.strictObject({
			emblem: z.strictObject({
				id: z.number(),
				media: z.strictObject({
					key: KeyResponse,
					id: z.number(),
				}),
				color: z.strictObject({
					id: z.number(),
					rgba: ColorObject.optional(),
				}),
			}),
			border: z.strictObject({
				id: z.number(),
				media: z.strictObject({
					key: KeyResponse,
					id: z.number(),
				}),
				color: z.strictObject({
					id: z.number(),
					rgba: ColorObject.optional(),
				}),
			}),
			background: z.strictObject({
				color: z.strictObject({
					id: z.number(),
					rgba: ColorObject.optional(),
				}),
			}),
		})
		.optional(),
	items: z.array(
		z.strictObject({
			id: z.number(),
			slot: ItemIventoryType,
			enchant: z.number(),
			item_appearance_modifier_id: z.number().optional(),
			subclass: z.number().optional(),
			secondary_id: z.number().optional(),
			secondary_item_appearance_modifier_id: z.number().optional(),
			secondary_subclass: z.number().optional(),
			internal_slot_id: z.number(),
		}),
	),
	customizations: z.array(
		z.strictObject({
			option: z.strictObject({
				name: LocaleResponse.optional(),
				id: z.number(),
			}),
			choice: z.strictObject({
				id: z.number(),
				name: LocaleResponse.optional(),
				display_order: z.number(),
			}),
		}),
	),
})

export function CharacterAppearanceSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterAppearanceSummaryResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/appearance`,
		namespace: 'profile',
		zod: CharacterAppearanceSummaryResponse,
	})
}
