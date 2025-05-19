import z from "zod";
import { LocaleResponse } from "../types";

export const Faction = z.object({
	type: z.enum(["HORDE", "ALLIANCE"]),
	name: LocaleResponse,
});
