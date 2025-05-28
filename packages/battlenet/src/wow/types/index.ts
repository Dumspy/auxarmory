import { z } from "zod/v4";
import { LocaleResponse } from "../../types";

export const Faction = z.strictObject({
	type: z.enum(["HORDE", "ALLIANCE"]),
	name: LocaleResponse,
})

export const ColorObject = z.strictObject({
	r: z.number().int().min(0).max(255),
	g: z.number().int().min(0).max(255),
	b: z.number().int().min(0).max(255),
	a: z.number().min(0).max(1),
})
