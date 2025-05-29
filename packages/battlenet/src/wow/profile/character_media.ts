import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function CharacterMediaSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/character-media`,
		namespace: "profile",
		zod: z.unknown(),
	});
}
