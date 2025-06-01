import { createSubjects } from "@openauthjs/openauth/subject";
import z from "zod";

export const subjects = createSubjects({
	account: z.object({
		id: z.string(),
		battletag: z.string(),
	}),
});
