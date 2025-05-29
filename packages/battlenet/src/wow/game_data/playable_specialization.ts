import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function PlayableSpecializationIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/playable-specialization/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function PlayableSpecialization(this: WoWGameDataClient, id: number) {
	return this.request<unknown>({
		endpoint: `data/wow/playable-specialization/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function PlayableSpecializationMedia(
	this: WoWGameDataClient,
	id: number,
) {
	return this.request<unknown>({
		endpoint: `data/wow/media/playable-specialization/${id}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
