import { z } from "zod/v4";

import type { WoWProfileClient } from "..";
import {
	KeyIdResponse,
	KeyNameIdResponse,
	KeyResponse,
	LocaleResponse,
	NameIdResponse,
} from "../../types";
import { Faction, Gender, Realm } from "../types";
import { CharacterResponse } from "../types/character";
import { ItemIventoryType } from "../types/item";

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
export function AccountProfileSummary(this: WoWProfileClient) {
	return this.request<z.infer<typeof AccountProfileSummaryResponse>>({
		endpoint: `profile/user/wow`,
		zod: AccountProfileSummaryResponse,
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
) {
	return this.request<
		z.infer<typeof ProtectedCharacterProfileSummaryResponse>
	>({
		endpoint: `profile/user/wow/protected-character/${realmId}-${characterId}`,
		zod: ProtectedCharacterProfileSummaryResponse,
	});
}

export const AccountCollectionIndexResponse = ProfileLinkSelf.extend({
	pets: KeyResponse,
	mounts: KeyResponse,
	heirlooms: KeyResponse,
	toys: KeyResponse,
	transmogs: KeyResponse,
});
export function AccountCollectionIndex(this: WoWProfileClient) {
	return this.request<z.infer<typeof AccountCollectionIndexResponse>>({
		endpoint: `profile/user/wow/collections`,
		zod: AccountCollectionIndexResponse,
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
export function AccountHeirloomsCollectionSummary(this: WoWProfileClient) {
	return this.request<
		z.infer<typeof AccountHeirloomsCollectionSummaryResponse>
	>({
		endpoint: `profile/user/wow/collections/heirlooms`,
		zod: AccountHeirloomsCollectionSummaryResponse,
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
export function AccountMountsCollectionSummary(this: WoWProfileClient) {
	return this.request<z.infer<typeof AccountMountsCollectionSummaryResponse>>(
		{
			endpoint: `profile/user/wow/collections/mounts`,
			zod: AccountMountsCollectionSummaryResponse,
		},
	);
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
export function AccountPetsCollectionSummary(this: WoWProfileClient) {
	return this.request<z.infer<typeof AccountPetsCollectionSummaryResponse>>({
		endpoint: `profile/user/wow/collections/pets`,
		zod: AccountPetsCollectionSummaryResponse,
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
export function AccountToysCollectionSummary(this: WoWProfileClient) {
	return this.request<z.infer<typeof AccountToysCollectionSummaryResponse>>({
		endpoint: `profile/user/wow/collections/toys`,
		zod: AccountToysCollectionSummaryResponse,
	});
}

export const AccountTransmogCollectionSummaryResponse = ProfileLinkSelf.extend({
	appearance_sets: z.array(KeyNameIdResponse),
	slots: z.array(
		z.strictObject({
			slot: ItemIventoryType,
			appearances: z.array(KeyIdResponse),
		}),
	),
});
export function AccountTransmogCollectionSummary(this: WoWProfileClient) {
	return this.request<
		z.infer<typeof AccountTransmogCollectionSummaryResponse>
	>({
		endpoint: `profile/user/wow/collections/transmogs`,
		zod: AccountTransmogCollectionSummaryResponse,
	});
}
