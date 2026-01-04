import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";
import {
	KeyIdResponse,
	KeyNameIdResponse,
	KeyNameResponse,
	LinkSelfResponse,
	LocaleResponse,
	MediaAssetArray,
	MediaKeyResponse,
} from "../../types";
import { SpellTooltips } from "../types";

export const PlayableSpecializationIndexResponse = LinkSelfResponse.extend({
	character_specializations: z.array(KeyNameIdResponse),
	pet_specializations: z.array(KeyNameIdResponse),
});
export function PlayableSpecializationIndex(this: WoWGameDataClient) {
	return this.request<z.infer<typeof PlayableSpecializationIndexResponse>>({
		endpoint: `data/wow/playable-specialization/index`,
		namespace: "static",
		zod: PlayableSpecializationIndexResponse,
	});
}

const BasePlayableSpec = LinkSelfResponse.extend({
	id: z.number(),
	name: LocaleResponse,
	playable_class: z.union([KeyIdResponse, KeyNameIdResponse]),
	gender_description: z.strictObject({
		male: LocaleResponse,
		female: LocaleResponse,
	}),
	media: MediaKeyResponse,
	role: z.strictObject({
		type: z.enum(["TANK", "DAMAGE", "HEALER"]),
		name: LocaleResponse,
	}),
	power_type: z.union([KeyIdResponse, KeyNameIdResponse]),
	primary_stat_type: z.strictObject({
		type: z.enum(["STRENGTH", "AGILITY", "INTELLECT"]),
		name: LocaleResponse,
	}),
});

export const PlayableSpecializationResponse = z.union([
	BasePlayableSpec,
	BasePlayableSpec.extend({
		pvp_talents: z.array(
			z.strictObject({
				talent: KeyNameIdResponse,
				spell_tooltip: SpellTooltips.omit({ spell: true }),
			}),
		),
		hero_talent_trees: z.array(KeyNameIdResponse),
		spec_talent_tree: KeyNameResponse,
	}),
]);
export function PlayableSpecialization(this: WoWGameDataClient, id: number) {
	return this.request<z.infer<typeof PlayableSpecializationResponse>>({
		endpoint: `data/wow/playable-specialization/${id}`,
		namespace: "static",
		zod: PlayableSpecializationResponse,
	});
}

export const PlayableSpecializationMediaResponse = LinkSelfResponse.extend({
	id: z.number(),
	assets: MediaAssetArray,
});
export function PlayableSpecializationMedia(
	this: WoWGameDataClient,
	id: number,
) {
	return this.request<z.infer<typeof PlayableSpecializationMediaResponse>>({
		endpoint: `data/wow/media/playable-specialization/${id}`,
		namespace: "static",
		zod: PlayableSpecializationMediaResponse,
	});
}
