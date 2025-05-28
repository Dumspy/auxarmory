import { z } from "zod/v4";
import { KeyNameIdResponse, KeyResponse } from "../../types";

export const CharacterResponse = z.strictObject({
	key: KeyResponse,
	name: z.string(),
	id: z.number(),
	realm: KeyNameIdResponse.extend({
		slug: z.string(),
	}),
});
