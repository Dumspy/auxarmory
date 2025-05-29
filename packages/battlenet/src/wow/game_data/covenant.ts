import { z } from "zod/v4";

import { WoWGameDataClient } from "..";
import {
	KeyNameIdResponse,
	KeyResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaAssetArray,
	MediaKeyResponse,
} from "../../types";

export const CovenantIndexResponse = LinkSelfResponse.extend({
	covenants: z.array(KeyNameIdResponse),
});
export function CovenantIndex(
	this: WoWGameDataClient,
): Promise<z.infer<typeof CovenantIndexResponse>> {
	return this.request({
		endpoint: `data/wow/covenant/index`,
		namespace: "static",
	});
}

export const CovenantSpellTooltip = z.strictObject({
	spell: KeyNameIdResponse,
	description: LocaleResponse,
	cast_time: LocaleResponse,
	range: LocaleResponse.optional(),
	cooldown: LocaleResponse.optional(),
});

export const CovenantResponese = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	description: LocaleResponse,
	signature_ability: z
		.strictObject({
			id: z.number(),
			spell_tooltip: CovenantSpellTooltip,
		})
		.optional(),
	class_abilities: z
		.array(
			z.strictObject({
				id: z.number(),
				playable_class: KeyNameIdResponse,
				spell_tooltip: CovenantSpellTooltip,
			}),
		)
		.optional(),
	soulbinds: z.array(KeyNameIdResponse).optional(),
	renown_rewards: z.array(
		z.strictObject({
			level: z.number(),
			reward: KeyNameIdResponse,
		}),
	),
	media: MediaKeyResponse.optional(),
});
export function Covenant(
	this: WoWGameDataClient,
	covenantId: number,
): Promise<z.infer<typeof CovenantResponese>> {
	return this.request({
		endpoint: `data/wow/covenant/${covenantId}`,
		namespace: "static",
	});
}

export const CovenantMediaResponse = LinkSelfResponse.extend({
	id: z.number().optional(),
	assets: MediaAssetArray.optional(),
});
export function CovenantMedia(
	this: WoWGameDataClient,
	covenantId: number,
): Promise<z.infer<typeof CovenantMediaResponse>> {
	return this.request({
		endpoint: `data/wow/media/covenant/${covenantId}`,
		namespace: "static",
	});
}

export const CovenantSoulbindIndexReponse = LinkSelfResponse.extend({
	soulbinds: z.array(KeyNameIdResponse),
});
export function CovenantSoulbindIndex(
	this: WoWGameDataClient,
): Promise<z.infer<typeof CovenantSoulbindIndexReponse>> {
	return this.request({
		endpoint: `data/wow/covenant/soulbind/index`,
		namespace: "static",
	});
}

export const CovenantSoulbindResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	covenant: KeyNameIdResponse,
	creature: KeyNameIdResponse,
	follower: z.strictObject({
		id: z.number(),
		name: LocaleResponse,
	}),
	talent_tree: KeyNameIdResponse,
});
export function CovenantSoulbind(
	this: WoWGameDataClient,
	soulbindId: number,
): Promise<z.infer<typeof CovenantSoulbindResponse>> {
	return this.request({
		endpoint: `data/wow/covenant/soulbind/${soulbindId}`,
		namespace: "static",
	});
}

export const CovenantConduitIndexResponse = LinkSelfResponse.extend({
	conduits: z.array(KeyNameIdResponse),
});
export function CovenantConduitIndex(
	this: WoWGameDataClient,
): Promise<z.infer<typeof CovenantConduitIndexResponse>> {
	return this.request({
		endpoint: `data/wow/covenant/conduit/index`,
		namespace: "static",
	});
}

export const CovenantConduitResponse = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	item: KeyNameIdResponse,
	socket_type: z.strictObject({
		type: z.enum(["POTENCY", "FINESSE", "ENDURANCE"]),
		name: LocaleResponse,
	}),
	ranks: z.array(
		z.strictObject({
			id: z.number(),
			tier: z.number(),
			spell_tooltip: CovenantSpellTooltip,
		}),
	),
});
export function CovenantConduit(
	this: WoWGameDataClient,
	conduitId: number,
): Promise<z.infer<typeof CovenantConduitResponse>> {
	return this.request({
		endpoint: `data/wow/covenant/conduit/${conduitId}`,
		namespace: "static",
	});
}
