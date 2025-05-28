import { z } from "zod/v4";
import { KeyNameIdResponse, KeyResponse } from "../../types";
import { Realm } from ".";

export const CharacterResponse = z.strictObject({
	key: KeyResponse,
	name: z.string(),
	id: z.number(),
	realm: Realm,
});
