import { z } from 'zod/v4'

import { ColorObject, Faction } from '.'
import {
	KeyNameIdResponse,
	KeyResponse,
	LocaleResponse,
	MediaKeyResponse,
	NameIdResponse,
} from '../../types'

export const ItemIventoryType = z.strictObject({
	type: z.enum([
		'WEAPON',
		'TWOHWEAPON',
		'WEAPONMAINHAND',
		'WEAPONOFFHAND',
		'RANGED',
		'SHOULDER',
		'TRINKET',
		'CHEST',
		'RANGEDRIGHT',
		'ROBE',
		'FINGER',
		'CLOAK',
		'LEGS',
		'HEAD',
		'SHIELD',
		'HOLDABLE',
		'NECK',
		'HAND',
		'FEET',
		'NON_EQUIP',
		'WAIST',
		'WRIST',
		'THROWN',
		'BAG',
		'FINGER_1',
		'FINGER_2',
		'TRINKET_1',
		'TRINKET_2',
		'BACK',
		'MAIN_HAND',
		'OFF_HAND',
		'TABARD',
		'HANDS',
		'SHIRT',
		'BODY',
		'PROFESSION_TOOL',
		'PROFESSION_GEAR',
	]),
	name: LocaleResponse,
})

export const ItemQuality = z.strictObject({
	type: z.enum([
		'HEIRLOOM',
		'POOR',
		'UNCOMMON',
		'COMMON',
		'RARE',
		'EPIC',
		'ARTIFACT',
		'LEGENDARY',
	]),
	name: LocaleResponse,
})

const StatEnum = z.enum([
	'INTELLECT',
	'AGILITY',
	'STRENGTH',
	'STAMINA',
	'HASTE_RATING',
	'CRIT_RATING',
	'VERSATILITY',
	'MASTERY_RATING',
	'DODGE_RATING',
	'PARRY_RATING',
	'FROST_RESISTANCE',
	'COMBAT_RATING_AVOIDANCE',
	'COMBAT_RATING_LIFESTEAL',
	'COMBAT_RATING_SPEED',
	'CORRUPTION_RESISTANCE',
])

const Upgrade = z.strictObject({
	value: z.number(),
	max_value: z.number(),
	display_string: LocaleResponse,
})

const BaseItem = z.strictObject({
	item: z.strictObject({
		id: z.number(),
		key: KeyResponse,
	}),
	context: z.number().optional(),
	quality: ItemQuality,
	name: LocaleResponse,
	media: MediaKeyResponse,
	item_class: KeyNameIdResponse,
	item_subclass: KeyNameIdResponse,
	inventory_type: ItemIventoryType,
	bonus_list: z.array(z.number()).optional(),
	binding: z.strictObject({
		type: z.enum(['TO_ACCOUNT', 'ON_EQUIP', 'ON_ACQUIRE', 'QUEST']),
		name: LocaleResponse,
	}),
	spells: z
		.array(
			z.strictObject({
				spell: KeyNameIdResponse,
				description: LocaleResponse,
				display_color: ColorObject.optional(),
			}),
		)
		.optional(),
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
	weapon: z
		.strictObject({
			damage: z.strictObject({
				min_value: z.number(),
				max_value: z.number(),
				display_string: LocaleResponse,
				damage_class: z.strictObject({
					type: z.enum(['PHYSICAL', 'NATURE']),
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
		})
		.optional(),
	armor: z
		.strictObject({
			value: z.number(),
			display: z.strictObject({
				display_string: LocaleResponse,
				color: ColorObject,
			}),
		})
		.optional(),
	shield_block: z
		.strictObject({
			value: z.number(),
			display: z.strictObject({
				display_string: LocaleResponse,
				color: ColorObject,
			}),
		})
		.optional(),
	stats: z.array(
		z.strictObject({
			type: z.strictObject({
				type: StatEnum,
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
	requirements: z
		.strictObject({
			level: z
				.strictObject({
					value: z.number().optional(),
					display_string: LocaleResponse,
				})
				.optional(),
			faction: z
				.strictObject({
					value: Faction,
					display_string: LocaleResponse,
				})
				.optional(),
			playable_classes: z
				.strictObject({
					links: z.array(KeyNameIdResponse),
					display_string: LocaleResponse,
				})
				.optional(),
			playable_races: z
				.strictObject({
					links: z.array(KeyNameIdResponse),
					display_string: LocaleResponse,
				})
				.optional(),
			reputation: z
				.strictObject({
					faction: KeyNameIdResponse,
					min_reputation_level: z.number(),
					display_string: LocaleResponse,
				})
				.optional(),
		})
		.optional(),
	sockets: z
		.array(
			z.strictObject({
				socket_type: z.strictObject({
					type: z.enum([
						'PRISMATIC',
						'META',
						'SINGING_THUNDER',
						'SINGING_SEA',
						'SINGING_WIND',
						'TINKER',
						'COGWHEEL',
					]),
					name: LocaleResponse,
				}),
			}),
		)
		.optional(),
	socket_bonus: LocaleResponse.optional(),
	description: LocaleResponse.optional(),
	limit_category: LocaleResponse.optional(),
	name_description: z
		.strictObject({
			display_string: LocaleResponse,
			color: ColorObject,
		})
		.optional(),
	sell_price: z.strictObject({
		value: z.number(),
		display_strings: z.strictObject({
			header: LocaleResponse,
			gold: LocaleResponse,
			silver: LocaleResponse,
			copper: LocaleResponse,
		}),
	}),
	durability: z.strictObject({
		value: z.number(),
		display_string: LocaleResponse,
	}),
})

export const HeirloomItem = BaseItem.omit({
	sell_price: true,
	durability: true,
})
	.extend({
		// BaseItem optional shapes
		set: BaseItem.shape.set.optional(),
	})
	.extend({
		// Modified BaseItem shapes
		quality: ItemQuality.extend({
			type: z.literal('HEIRLOOM'),
		}),
	})
	.extend({
		// New fields
		upgrades: Upgrade,
	})

const PreviewItemBase = BaseItem.extend({
	// BaseItem optional shapes
	stats: BaseItem.shape.stats.optional(),
	level: BaseItem.shape.level.optional(),
	binding: BaseItem.shape.binding.optional(),
	sell_price: BaseItem.shape.sell_price.optional(),
	durability: BaseItem.shape.durability.optional(),
})
	.extend({
		// Modified BaseItem shapes
		quality: ItemQuality.extend({
			type: ItemQuality.shape.type.exclude(['HEIRLOOM']),
		}),
		requirements: BaseItem.shape.requirements
			.unwrap()
			.extend({
				skill: z
					.strictObject({
						profession: KeyNameIdResponse,
						level: z.number().optional(),
						display_string: LocaleResponse.optional(),
					})
					.optional(),
				map: NameIdResponse.optional(),
				ability: z
					.strictObject({
						spell: KeyNameIdResponse,
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
		crafting_reagent: LocaleResponse.optional(),
		container_slots: z
			.strictObject({
				value: z.number(),
				display_string: LocaleResponse,
			})
			.optional(),
		expiration_time_left: z
			.strictObject({
				value: z.number(),
				display_string: LocaleResponse,
			})
			.optional(),
		gem_properties: z
			.strictObject({
				effect: LocaleResponse,
			})
			.optional(),
		charges: z
			.strictObject({
				value: z.number(),
				display_string: LocaleResponse,
			})
			.optional(),
	})

export const PreviewItem = PreviewItemBase.extend({
	recipe: z
		.strictObject({
			item: PreviewItemBase,
			reagents: z.array(
				z.strictObject({
					reagent: KeyNameIdResponse,
					quantity: z.number(),
				}),
			),
			reagents_display_string: LocaleResponse.optional(),
		})
		.optional(),
	toy: LocaleResponse.optional(),
})

export const CharacterEquipmentItem = BaseItem.extend({
	// BaseItem optional shapes
	sell_price: BaseItem.shape.sell_price.optional(),
	durability: BaseItem.shape.durability.optional(),
	stats: BaseItem.shape.stats.optional(),
})
	.extend({
		// Modified BaseItem shapes
		set: BaseItem.shape.set
			.extend({
				items: z.array(
					z.strictObject({
						item: KeyNameIdResponse,
						is_equipped: z.boolean().optional(),
					}),
				),
				effects: z.array(
					BaseItem.shape.set.shape.effects.element.extend({
						is_active: z.boolean().optional(),
					}),
				),
			})
			.optional(),
	})
	.extend({
		// New fields
		is_equipped: z.boolean().optional(),
		slot: ItemIventoryType,
		quantity: z.number(),
		transmog: z
			.union([
				z.strictObject({
					item: KeyNameIdResponse,
					display_string: LocaleResponse,
					item_modified_appearance_id: z.number().optional(),
				}),
				z.strictObject({
					item: KeyNameIdResponse,
					display_string: LocaleResponse,
					item_modified_appearance_id: z.number().optional(),
					second_item: KeyNameIdResponse,
					second_item_modified_appearance_id: z.number(),
				}),
			])
			.optional(),
		modified_appearance_id: z.number().optional(),
		sockets: z
			.array(
				BaseItem.shape.sockets.unwrap().element.extend({
					item: KeyNameIdResponse.optional(),
					context: z.number().optional(),
					display_string: LocaleResponse.optional(),
					media: MediaKeyResponse.optional(),
					display_color: ColorObject.optional(),
				}),
			)
			.optional(),
		enchantments: z
			.array(
				z.strictObject({
					display_string: LocaleResponse,
					source_item: KeyNameIdResponse.optional(),
					enchantment_id: z.number(),
					enchantment_slot: z.strictObject({
						id: z.number(),
						type: z.enum(['PERMANENT', 'TEMPORARY']),
					}),
				}),
			)
			.optional(),
		modified_crafting_stat: z
			.array(
				NameIdResponse.extend({
					type: StatEnum,
				}),
			)
			.optional(),
		timewalker_level: z.number().optional(),
		upgrades: Upgrade.optional(),
	})
