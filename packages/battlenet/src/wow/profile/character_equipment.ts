import { z } from 'zod/v4';

import type { WoWGameDataClient } from '..';
import {
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
} from '../../types';
import { CharacterResponse } from '../types/character';
import { CharacterEquipmentItem } from '../types/item';

export const CharacterEquipmentSummaryResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	equipped_items: z.array(CharacterEquipmentItem),
	equipped_item_sets: z
		.array(
			z.strictObject({
				item_set: KeyNameIdResponse,
				items: z.array(
					z.strictObject({
						item: KeyNameIdResponse,
						is_equipped: z.boolean().optional(),
					}),
				),
				effects: z.array(
					z.strictObject({
						display_string: LocaleResponse,
						required_count: z.int(),
						is_active: z.boolean().optional(),
					}),
				),
				display_string: LocaleResponse,
			}),
		)
		.optional(),
});
export function CharacterEquipmentSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<z.infer<typeof CharacterEquipmentSummaryResponse>>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/equipment`,
		namespace: 'profile',
		zod: CharacterEquipmentSummaryResponse,
	});
}
