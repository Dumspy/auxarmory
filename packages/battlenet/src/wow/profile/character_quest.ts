import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function CharacterQuests(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/quests`,
		namespace: "profile",
		zod: z.unknown(),
	});
}

export function CharacterCompletedQuests(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request<unknown>({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/quests/completed`,
		namespace: "profile",
		zod: z.unknown(),
	});
}
