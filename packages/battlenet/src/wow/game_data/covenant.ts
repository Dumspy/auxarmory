import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import {
	KeyNameIdResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaAssetArray,
	MediaKeyResponse,
} from "../../types";

export const CovenantIndexResponse = LinkSelfResponse.extend({
	covenants: z.array(KeyNameIdResponse),
});
export function CovenantIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof CovenantIndexResponse>>({
		endpoint: `data/wow/covenant/index`,
		namespace: "static",
		zod: CovenantIndexResponse,
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
export function Covenant(this: WoWGameDataClient, covenantId: number) {
	return this.request<z.infer<typeof CovenantResponese>>({
		endpoint: `data/wow/covenant/${covenantId}`,
		namespace: "static",
		zod: CovenantResponese,
	});
}

export const CovenantMediaResponse = LinkSelfResponse.extend({
	id: z.number().optional(),
	assets: MediaAssetArray.optional(),
});
export function CovenantMedia(this: WoWGameDataClient, covenantId: number) {
	return this.request<z.infer<typeof CovenantMediaResponse>>({
		endpoint: `data/wow/media/covenant/${covenantId}`,
		namespace: "static",
		zod: CovenantMediaResponse,
	});
}

export const CovenantSoulbindIndexReponse = LinkSelfResponse.extend({
	soulbinds: z.array(KeyNameIdResponse),
});
export function CovenantSoulbindIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof CovenantSoulbindIndexReponse>>({
		endpoint: `data/wow/covenant/soulbind/index`,
		namespace: "static",
		zod: CovenantSoulbindIndexReponse,
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
export function CovenantSoulbind(this: WoWGameDataClient, soulbindId: number) {
	return this.request<z.infer<typeof CovenantSoulbindResponse>>({
		endpoint: `data/wow/covenant/soulbind/${soulbindId}`,
		namespace: "static",
		zod: CovenantSoulbindResponse,
	});
}

export const CovenantConduitIndexResponse = LinkSelfResponse.extend({
	conduits: z.array(KeyNameIdResponse),
});
export function CovenantConduitIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof CovenantConduitIndexResponse>>({
		endpoint: `data/wow/covenant/conduit/index`,
		namespace: "static",
		zod: CovenantConduitIndexResponse,
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
export function CovenantConduit(this: WoWGameDataClient, conduitId: number) {
	return this.request<z.infer<typeof CovenantConduitResponse>>({
		endpoint: `data/wow/covenant/conduit/${conduitId}`,
		namespace: "static",
		zod: CovenantConduitResponse,
	});
}
