import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function CharacterHunterPetsSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/hunter-pets`,
		namespace: "profile",
		zod: z.unknown(),
	});
}
