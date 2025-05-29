import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function CharacterSoulbinds(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/soulbinds`,
		namespace: "profile",
		zod: z.unknown(),
	});
}
