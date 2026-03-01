import { z } from 'zod/v4'

import type { WoWGameDataClient } from '..'
import {
	KeyNameIdResponse,
	KeyNameResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types'
import { SpellTooltips } from '../types'
import { CharacterResponse } from '../types/character'

const ToolTip = z.strictObject({
	talent: KeyNameIdResponse.extend({
		name: LocaleResponse.optional(),
	}),
	spell_tooltip: SpellTooltips,
})

export const CharacterSpecializationsSummaryResponse = LinkSelfResponse.extend({
	specializations: z.array(
		z.strictObject({
			specialization: KeyNameIdResponse,
			glyphs: z.array(KeyNameIdResponse).optional(),
			pvp_talent_slots: z
				.array(
					z.strictObject({
						selected: ToolTip,
						slot_number: z.number(),
					}),
				)
				.optional(),
			loadouts: z.array(
				z.strictObject({
					is_active: z.boolean(),
					talent_loadout_code: z.string(),
					selected_class_talents: z.array(
						z.strictObject({
							id: z.number(),
							rank: z.number(),
							tooltip: ToolTip.optional(),
							default_points: z.number().optional(),
						}),
					),
					selected_spec_talents: z.array(
						z.strictObject({
							id: z.number(),
							rank: z.number(),
							tooltip: ToolTip.optional(),
						}),
					),
					selected_hero_talents: z
						.array(
							z.strictObject({
								id: z.number(),
								rank: z.number(),
								tooltip: ToolTip.optional(),
								default_points: z.number().optional(),
							}),
						)
						.optional(),
					selected_class_talent_tree: KeyNameResponse,
					selected_spec_talent_tree: KeyNameResponse,
					selected_hero_talent_tree: KeyNameIdResponse.optional(),
				}),
			),
		}),
	),
	active_specialization: KeyNameIdResponse,
	character: CharacterResponse,
	active_hero_talent_tree: KeyNameIdResponse.optional(),
})
export function CharacterSpecializationsSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<
		z.infer<typeof CharacterSpecializationsSummaryResponse>
	>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/specializations`,
		namespace: 'profile',
		zod: CharacterSpecializationsSummaryResponse,
	})
}
