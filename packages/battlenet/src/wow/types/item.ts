import { z } from "zod/v4";

import { ColorObject, Faction } from ".";
import {
	KeyNameIdResponse,
	KeyResponse,
	LocaleResponse,
	MediaKeyResponse,
} from "../../types";

export const ItemIventoryType = z.strictObject({
	type: z.enum([
		"WEAPON",
		"TWOHWEAPON",
		"RANGED",
		"SHOULDER",
		"TRINKET",
		"CHEST",
		"RANGEDRIGHT",
		"ROBE",
		"FINGER",
		"CLOAK",
		"LEGS",
		"HEAD",
		"SHIELD",
		"HOLDABLE",
		"NECK",
		"HAND",
		"FEET",
		"NON_EQUIP",
		"WAIST",
		"WRIST",
		"THROWN",
	]),
	name: LocaleResponse,
});

export const ItemQuality = z.strictObject({
	type: z.enum([
		"HEIRLOOM",
		"POOR",
		"UNCOMMON",
		"COMMON",
		"RARE",
		"EPIC",
		"ARTIFACT",
	]),
	name: LocaleResponse,
});

const BaseItem = z.strictObject({
	item: z.strictObject({
		id: z.number(),
		key: KeyResponse,
	}),
	context: z.number(),
	quality: ItemQuality,
	name: LocaleResponse,
	media: MediaKeyResponse,
	item_class: KeyNameIdResponse,
	item_subclass: KeyNameIdResponse,
	inventory_type: ItemIventoryType,
	bonus_list: z.array(z.number()),
	binding: z.strictObject({
		type: z.enum(["TO_ACCOUNT", "ON_EQUIP", "ON_ACQUIRE", "QUEST"]),
		name: LocaleResponse,
	}),
	spells: z.array(
		z.strictObject({
			spell: KeyNameIdResponse,
			description: LocaleResponse,
		}),
	),
	unique_equipped: LocaleResponse.optional(),
	is_subclass_hidden: z.boolean().optional(),
	set: z.strictObject({
		item_set: KeyNameIdResponse,
		items: z.array(z.strictObject({ item: KeyNameIdResponse })),
		effects: z.array(
			z.strictObject({
				display_string: LocaleResponse,
				required_count: z.number(),
			}),
		),
		display_string: LocaleResponse,
	}),
	weapon: z.strictObject({
		damage: z.strictObject({
			min_value: z.number(),
			max_value: z.number(),
			display_string: LocaleResponse,
			damage_class: z.strictObject({
				type: z.enum(["PHYSICAL"]),
				name: LocaleResponse,
			}),
		}),
		attack_speed: z.strictObject({
			value: z.number(),
			display_string: LocaleResponse,
		}),
		dps: z.strictObject({
			value: z.number(),
			display_string: LocaleResponse,
		}),
	}),
	armor: z.strictObject({
		value: z.number(),
		display: z.strictObject({
			display_string: LocaleResponse,
			color: ColorObject,
		}),
	}),
	stats: z.array(
		z.strictObject({
			type: z.strictObject({
				type: z.enum([
					"INTELLECT",
					"AGILITY",
					"STRENGTH",
					"STAMINA",
					"HASTE_RATING",
					"CRIT_RATING",
					"VERSATILITY",
					"MASTERY_RATING",
					"DODGE_RATING",
				]),
				name: LocaleResponse,
			}),
			is_equip_bonus: z.boolean().optional(),
			is_negated: z.boolean().optional(),
			value: z.number(),
			display: z.strictObject({
				display_string: LocaleResponse,
				color: ColorObject,
			}),
		}),
	),
	level: z.strictObject({
		value: z.number(),
		display_string: LocaleResponse,
	}),
	requirements: z.strictObject({
		level: z.strictObject({
			value: z.number(),
			display_string: LocaleResponse,
		}),
		faction: z
			.strictObject({
				value: Faction,
				display_string: LocaleResponse,
			})
			.optional(),
	}),
	sockets: z.array(
		z.strictObject({
			socket_type: z.strictObject({
				type: z.enum(["PRISMATIC"]),
				name: LocaleResponse,
			}),
		}),
	),
	socket_bonus: LocaleResponse,
	description: LocaleResponse,
	limit_category: LocaleResponse,
	name_description: z.strictObject({
		display_string: LocaleResponse,
		color: ColorObject,
	}),
});

export const HeirloomItem = BaseItem.extend({
	// BaseItem optional shapes
	context: BaseItem.shape.context.optional(),
	bonus_list: BaseItem.shape.bonus_list.optional(),
	weapon: BaseItem.shape.weapon.optional(),
	armor: BaseItem.shape.armor.optional(),
	set: BaseItem.shape.set.optional(),
	limit_category: BaseItem.shape.limit_category.optional(),
	spells: BaseItem.shape.spells.optional(),
	sockets: BaseItem.shape.sockets.optional(),
	socket_bonus: BaseItem.shape.socket_bonus.optional(),
	description: BaseItem.shape.description.optional(),
	name_description: BaseItem.shape.name_description.optional(),
})
	.extend({
		// Modified BaseItem shapes
		quality: ItemQuality.extend({
			type: z.literal("HEIRLOOM"),
		}),
	})
	.extend({
		// New fields
		upgrades: z.strictObject({
			value: z.number(),
			max_value: z.number(),
			display_string: LocaleResponse,
		}),
		shield_block: z
			.strictObject({
				value: z.number(),
				display: z.strictObject({
					display_string: LocaleResponse,
					color: ColorObject,
				}),
			})
			.optional(),
	});

// TODO: This is not fully documented yet
export const PreviewItem = BaseItem.extend({
	// from BaseItem shapes
	context: BaseItem.shape.context.optional(),
	weapon: BaseItem.shape.weapon.optional(),
	armor: BaseItem.shape.armor.optional(),
	bonus_list: BaseItem.shape.bonus_list.optional(),
	spells: BaseItem.shape.spells.optional(),
	stats: BaseItem.shape.stats.optional(),
	level: BaseItem.shape.level.optional(),
	sockets: BaseItem.shape.sockets.optional(),
	socket_bonus: BaseItem.shape.socket_bonus.optional(),
	binding: BaseItem.shape.binding.optional(),
	description: BaseItem.shape.description.optional(),
	limit_category: BaseItem.shape.limit_category.optional(),
	name_description: BaseItem.shape.name_description.optional(),
})
	.extend({
		// Modified BaseItem shapes
		quality: ItemQuality.extend({
			type: ItemQuality.shape.type.exclude(["HEIRLOOM"]),
		}),
		requirements: BaseItem.shape.requirements
			.extend({
				playable_classes: z
					.strictObject({
						links: z.array(KeyNameIdResponse),
						display_string: LocaleResponse,
					})
					.optional(),
			})
			.optional(),
		set: BaseItem.shape.set
			.extend({
				legacy: LocaleResponse.optional(),
			})
			.optional(),
	})
	.extend({
		// New fields
		sell_price: z.strictObject({
			value: z.number(),
			display_strings: z.strictObject({
				header: LocaleResponse,
				gold: LocaleResponse,
				silver: LocaleResponse,
				copper: LocaleResponse,
			}),
		}),
		durability: z
			.strictObject({
				value: z.number(),
				display_string: LocaleResponse,
			})
			.optional(),
		crafting_reagent: LocaleResponse.optional(),
	});
