import { z } from "zod/v4";

import { KeyIdResponse, KeyNameIdResponse, LocaleResponse } from "../../types";

export const FactionEnum = z.enum(["HORDE", "ALLIANCE", "NEUTRAL"]);

export const Faction = z.strictObject({
	type: FactionEnum,
	name: LocaleResponse,
});

export const ColorObject = z.strictObject({
	r: z.number().int().min(0).max(255),
	g: z.number().int().min(0).max(255),
	b: z.number().int().min(0).max(255),
	a: z.number().min(0).max(1),
});

export const Realm = KeyNameIdResponse.extend({
	name: LocaleResponse.optional(),
	slug: z.string(),
});

export const Gender = z.strictObject({
	type: z.enum(["MALE", "FEMALE"]),
	name: LocaleResponse,
});

export const SpellTooltips = z.strictObject({
	spell: z.union([KeyIdResponse, KeyNameIdResponse]),
	description: LocaleResponse.optional(),
	cast_time: LocaleResponse.optional(),
	power_cost: LocaleResponse.optional(),
	range: LocaleResponse.optional(),
	cooldown: LocaleResponse.optional(),
});
