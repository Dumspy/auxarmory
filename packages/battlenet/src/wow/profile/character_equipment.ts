import { z } from "zod/v4";

import { WoWGameDataClient } from "..";
import {
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
} from "../../types";
import { CharacterResponse } from "../types/character";

export const CharacterEquipmentSummaryResponse = LinkSelfResponse.extend({
	character: CharacterResponse,
	equipped_items: z.array(z.any()), // TODO: Requires item type to be completed firstly
	equipped_item_sets: z.array(
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
					is_active: z.boolean(),
				}),
			),
			display_string: LocaleResponse,
		}),
	),
});
export function CharacterEquipmentSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
): Promise<z.infer<typeof CharacterEquipmentSummaryResponse>> {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/equipment`,
		namespace: "profile",
	});
}
