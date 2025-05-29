import { z } from "zod/v4";

import { WoWGameDataClient } from "..";
import { KeyNameIdResponse, LinkSelfResponse } from "../../types";
import { CharacterResponse } from "../types/character";

const RatingResponse = z.strictObject({
	rating_bonus: z.number(),
	rating_normalized: z.number(),
});

const RatingValueResponse = RatingResponse.extend({
	value: z.number(),
});

const BaseEffectiveResponse = z.strictObject({
	base: z.number(),
	effective: z.number(),
});

export const CharacterStatisticsSummaryResponse = LinkSelfResponse.extend({
	health: z.number(),
	power: z.number(),
	power_type: KeyNameIdResponse,
	speed: RatingResponse,
	strength: BaseEffectiveResponse,
	agility: BaseEffectiveResponse,
	intellect: BaseEffectiveResponse,
	stamina: BaseEffectiveResponse,
	melee_crit: RatingValueResponse,
	melee_haste: RatingValueResponse,
	mastery: RatingValueResponse,
	lifesteal: RatingValueResponse,
	bonus_armor: z.number(),
	versatility: z.number(),
	versatility_damage_done_bonus: z.number(),
	versatility_healing_done_bonus: z.number(),
	versatility_damage_taken_bonus: z.number(),
	avoidance: RatingResponse,
	attack_power: z.number(),
	main_hand_damage_min: z.number(),
	main_hand_damage_max: z.number(),
	main_hand_speed: z.number(),
	main_hand_dps: z.number(),
	off_hand_damage_min: z.number(),
	off_hand_damage_max: z.number(),
	off_hand_speed: z.number(),
	off_hand_dps: z.number(),
	spell_power: z.number(),
	spell_penetration: z.number(),
	spell_crit: RatingValueResponse,
	mana_regen: z.number(),
	mana_regen_combat: z.number(),
	armor: BaseEffectiveResponse,
	dodge: RatingValueResponse,
	parry: RatingValueResponse,
	block: RatingValueResponse,
	ranged_crit: RatingValueResponse,
	ranged_haste: RatingValueResponse,
	spell_haste: RatingValueResponse,
	character: CharacterResponse,
});

export function CharacterStatisticsSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
): Promise<z.infer<typeof CharacterStatisticsSummaryResponse>> {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/statistics`,
		namespace: "profile",
	});
}
