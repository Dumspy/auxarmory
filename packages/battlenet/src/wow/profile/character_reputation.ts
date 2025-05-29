import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function CharacterReputationSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/reputations`,
		namespace: "profile",
		zod: z.unknown(),
	});
}
