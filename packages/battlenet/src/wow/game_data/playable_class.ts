import { z } from "zod/v4";

import type { WoWGameDataClient } from "..";

export function PlayableClassIndex(this: WoWGameDataClient) {
	return this.request<unknown>({
		endpoint: `data/wow/playable-class/index`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function PlayableClass(this: WoWGameDataClient, classId: number) {
	return this.request<unknown>({
		endpoint: `data/wow/playable-class/${classId}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function PlayableClassMedia(this: WoWGameDataClient, classId: number) {
	return this.request<unknown>({
		endpoint: `data/wow/media/playable-class/${classId}`,
		namespace: "static",
		zod: z.unknown(),
	});
}

export function PlayablePvPTalentSlot(
	this: WoWGameDataClient,
	classId: number,
) {
	return this.request<unknown>({
		endpoint: `data/wow/playable-pvp-talent-slot/${classId}`,
		namespace: "static",
		zod: z.unknown(),
	});
}
