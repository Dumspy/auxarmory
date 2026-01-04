import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import {
	KeyNameIdResponse,
	KeyNameResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
} from "../../types";
import { SpellTooltips } from "../types";

export const TalentTreeIndexResponse = LinkSelfResponse.extend({
	spec_talent_trees: z.array(KeyNameResponse),
	class_talent_trees: z.array(KeyNameResponse),
	hero_talent_trees: z.array(KeyNameIdResponse),
});
export function TalentTreeIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof TalentTreeIndexResponse>>({
		endpoint: `data/wow/talent-tree/index`,
		namespace: "static",
		zod: TalentTreeIndexResponse,
	});
}

const RankTooltip = z.strictObject({
	talent: KeyNameIdResponse,
	spell_tooltip: SpellTooltips,
});

const TalentTreeNode = z.array(
	z.strictObject({
		id: z.number(),
		locked_by: z.array(z.number()).optional(),
		unlocks: z.array(z.number()).optional(),
		node_type: z.strictObject({
			id: z.number(),
			type: z.enum(["CHOICE", "PASSIVE", "ACTIVE"]),
		}),
		ranks: z
			.array(
				z.strictObject({
					rank: z.number(),
					tooltip: RankTooltip.optional(),
					choice_of_tooltips: z.array(RankTooltip).optional(),
					default_points: z.number().optional(),
				}),
			)
			.optional(),
		display_row: z.number(),
		display_col: z.number(),
		raw_position_x: z.number(),
		raw_position_y: z.number(),
	}),
);

export const TalentTreeResponse = LinkSelfResponse.extend({
	id: z.number(),
	playable_class: KeyNameIdResponse,
	playable_specialization: KeyNameIdResponse,
	name: LocaleResponse,
	media: z.strictObject({
		key: KeyResponse,
	}),
	restriction_lines: z.array(
		z.strictObject({
			required_points: z.number(),
			restricted_row: z.number(),
			is_for_class: z.boolean(),
		}),
	),
	class_talent_nodes: TalentTreeNode,
	spec_talent_nodes: TalentTreeNode,
	hero_talent_trees: z.array(
		z.strictObject({
			id: z.number(),
			name: LocaleResponse,
			media: z.strictObject({
				key: KeyResponse,
				id: z.number(),
			}),
			hero_talent_nodes: TalentTreeNode,
			playable_class: KeyNameIdResponse,
			playable_specializations: z.array(KeyNameIdResponse),
		}),
	),
});
export function TalentTree(
	this: WoWGameDataClient,
	talentTreeId: number,
	specId: number,
) {
	return this.request<z.infer<typeof TalentTreeResponse>>({
		endpoint: `data/wow/talent-tree/${talentTreeId}/playable-specialization/${specId}`,
		namespace: "static",
		zod: TalentTreeResponse,
	});
}

export const TalentTreeNodesResponse = LinkSelfResponse.extend({
	id: z.number(),
	spec_talent_trees: z.array(KeyNameResponse),
	talent_nodes: TalentTreeNode,
});
export function TalentTreeNodes(this: WoWGameDataClient, talentTreeId: number) {
	return this.request<z.infer<typeof TalentTreeNodesResponse>>({
		endpoint: `data/wow/talent-tree/${talentTreeId}`,
		namespace: "static",
		zod: TalentTreeNodesResponse,
	});
}

export const TalentIndexResponse = LinkSelfResponse.extend({
	talents: z.array(KeyNameIdResponse),
});
export function TalentIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof TalentIndexResponse>>({
		endpoint: `data/wow/talent/index`,
		namespace: "static",
		zod: TalentIndexResponse,
	});
}
export const TalentResponse = LinkSelfResponse.extend({
	id: z.number(),
	rank_descriptions: z
		.array(
			z.strictObject({
				rank: z.number(),
				description: LocaleResponse,
			}),
		)
		.optional(),
	spell: KeyNameIdResponse.optional(),
	playable_class: KeyNameIdResponse.extend({
		name: LocaleResponse.optional(),
	}).optional(),
	playable_specialization: KeyNameIdResponse.optional(),
	overrides_spell: KeyNameIdResponse.optional(),
});
export function Talent(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof TalentResponse>>({
		endpoint: `data/wow/talent/${id}`,
		namespace: "static",
		zod: TalentResponse,
	});
}

export const PvPTalentIndexResponse = LinkSelfResponse.extend({
	pvp_talents: z.array(KeyNameIdResponse),
});
export function PvPTalentIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof PvPTalentIndexResponse>>({
		endpoint: `data/wow/pvp-talent/index`,
		namespace: "static",
		zod: PvPTalentIndexResponse,
	});
}

export const PvPTalentResponse = LinkSelfResponse.extend({
	id: z.number(),
	spell: KeyNameIdResponse,
	playable_specialization: KeyNameIdResponse,
	description: LocaleResponse,
	unlock_player_level: z.number(),
	compatible_slots: z.array(z.number()),
	overrides_spell: KeyNameIdResponse.optional(),
});
export function PvPTalent(this: WoWGameDataClient, pvpTalentId: number) {
	return this.request<z.infer<typeof PvPTalentResponse>>({
		endpoint: `data/wow/pvp-talent/${pvpTalentId}`,
		namespace: "static",
		zod: PvPTalentResponse,
	});
}
