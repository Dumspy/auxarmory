import { z } from "zod/v4";
import { WoWProfileClient } from "..";
import {
	KeyIdResponse,
	KeyNameIdResponse,
	KeyResponse,
	LocaleResponse,
	NameIdResponse,
} from "../../types";
import { Faction, Gender, Realm } from "../types";
import { CharacterResponse } from "../types/character";

const ProfileLinkSelf = z.strictObject({
	_links: z.strictObject({
		self: KeyResponse,
		user: KeyResponse,
		profile: KeyResponse,
	}),
});

export const AccountProfileSummaryResponse = ProfileLinkSelf.extend({
	id: z.number(),
	wow_accounts: z.array(
		z.strictObject({
			id: z.number(),
			characters: z.array(
				z.strictObject({
					character: KeyResponse,
					protected_character: KeyResponse,
					name: z.string(),
					id: z.number(),
					realm: Realm,
					playable_class: KeyNameIdResponse,
					playable_race: KeyNameIdResponse,
					gender: Gender,
					faction: Faction,
					level: z.int().min(1).max(80),
				}),
			),
		}),
	),
	collections: KeyResponse,
});
export function AccountProfileSummary(
	this: WoWProfileClient,
): Promise<z.infer<typeof AccountProfileSummaryResponse>> {
	return this.request({
		endpoint: `profile/user/wow`,
	});
}

export const ProtectedCharacterProfileSummaryResponse = ProfileLinkSelf.extend({
	id: z.number(),
	name: z.string(),
	money: z.number(),
	character: CharacterResponse,
	protected_stats: z.strictObject({
		total_number_deaths: z.number(),
		total_gold_gained: z.number(),
		total_gold_lost: z.number(),
		total_item_value_gained: z.number(),
		level_number_deaths: z.number(),
		level_gold_gained: z.number(),
		level_gold_lost: z.number(),
		level_item_value_gained: z.number(),
	}),
	position: z.strictObject({
		zone: NameIdResponse,
		map: NameIdResponse,
		x: z.number(),
		y: z.number(),
		z: z.number(),
		facing: z.number(),
	}),
	bind_position: z.strictObject({
		zone: NameIdResponse,
		map: NameIdResponse,
		x: z.number(),
		y: z.number(),
		z: z.number(),
		facing: z.number(),
	}),
	wow_account: z.number(),
});
export function ProtectedCharacterProfileSummary(
	this: WoWProfileClient,
	realmId: number,
	characterId: number,
): Promise<z.infer<typeof ProtectedCharacterProfileSummaryResponse>> {
	return this.request({
		endpoint: `profile/user/wow/protected-character/${realmId}-${characterId}`,
	});
}

export const AccountCollectionIndexResponse = ProfileLinkSelf.extend({
	pets: KeyResponse,
	mounts: KeyResponse,
	heirlooms: KeyResponse,
	toys: KeyResponse,
	transmogs: KeyResponse,
});
export function AccountCollectionIndex(
	this: WoWProfileClient,
): Promise<z.infer<typeof AccountCollectionIndexResponse>> {
	return this.request({
		endpoint: `profile/user/wow/collections`,
	});
}

export const AccountHeirloomsCollectionSummaryResponse = ProfileLinkSelf.extend(
	{
		heirlooms: z.array(
			z.strictObject({
				heirloom: KeyNameIdResponse,
				upgrade: z.strictObject({
					level: z.number(),
				}),
			}),
		),
	},
);
export function AccountHeirloomsCollectionSummary(
	this: WoWProfileClient,
): Promise<z.infer<typeof AccountHeirloomsCollectionSummaryResponse>> {
	return this.request({
		endpoint: `profile/user/wow/collections/heirlooms`,
	});
}

export const AccountMountsCollectionSummaryResponse = ProfileLinkSelf.extend({
	mounts: z.array(
		z.strictObject({
			mount: KeyNameIdResponse,
			is_favorite: z.boolean().optional(),
		}),
	),
});
export function AccountMountsCollectionSummary(
	this: WoWProfileClient,
): Promise<z.infer<typeof AccountMountsCollectionSummaryResponse>> {
	return this.request({
		endpoint: `profile/user/wow/collections/mounts`,
	});
}

export const AccountPetsCollectionSummaryResponse = ProfileLinkSelf.extend({
	pets: z.array(
		z.strictObject({
			species: KeyNameIdResponse,
			level: z.number(),
			quality: z.strictObject({
				type: z.enum(["POOR", "COMMON", "UNCOMMON", "RARE"]),
				name: LocaleResponse,
			}),
			stats: z.strictObject({
				breed_id: z.number(),
				health: z.number(),
				power: z.number(),
				speed: z.number(),
			}),
			creature_display: KeyIdResponse.optional(),
			id: z.number(),
			name: z.string().optional(),
			is_favorite: z.boolean().optional(),
			is_active: z.boolean().optional(),
			active_slot: z.number().optional(),
		}),
	),
	unlocked_battle_pet_slots: z.number(),
});
export function AccountPetsCollectionSummary(
	this: WoWProfileClient,
): Promise<z.infer<typeof AccountPetsCollectionSummaryResponse>> {
	return this.request({
		endpoint: `profile/user/wow/collections/pets`,
	});
}

export const AccountToysCollectionSummaryResponse = ProfileLinkSelf.extend({
	toys: z.array(
		z.strictObject({
			toy: KeyNameIdResponse,
			is_favorite: z.boolean().optional(),
		}),
	),
});
export function AccountToysCollectionSummary(
	this: WoWProfileClient,
): Promise<z.infer<typeof AccountToysCollectionSummaryResponse>> {
	return this.request({
		endpoint: `profile/user/wow/collections/toys`,
	});
}

export const AccountTransmogCollectionSummaryResponse = ProfileLinkSelf.extend({
	appearance_sets: z.array(KeyNameIdResponse),
	slots: z.array(
		z.strictObject({
			slot: z.strictObject({
				type: z.enum([
					"HEAD",
					"PROFESSION_TOOL",
					"RANGEDRIGHT",
					"HOLDABLE",
					"WEAPONOFFHAND",
					"WEAPONMAINHAND",
					"ROBE",
					"TABARD",
					"TWOHWEAPON",
					"CLOAK",
					"RANGED",
					"SHIELD",
					"WEAPON",
					"HAND",
					"WRIST",
					"FEET",
					"LEGS",
					"WAIST",
					"CHEST",
					"BODY",
					"SHOULDER",
				]),
				name: LocaleResponse,
			}),
			appearances: z.array(KeyIdResponse),
		}),
	),
});
export function AccountTransmogCollectionSummary(
	this: WoWProfileClient,
): Promise<z.infer<typeof AccountTransmogCollectionSummaryResponse>> {
	return this.request({
		endpoint: `profile/user/wow/collections/transmogs`,
	});
}
