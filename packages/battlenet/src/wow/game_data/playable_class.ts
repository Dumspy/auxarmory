import { WoWGameDataClient } from "..";

export function PlayableClassIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/playable-class/index`,
		namespace: "static",
	});
}

export function PlayableClass(this: WoWGameDataClient, classId: number) {
	return this.request({
		endpoint: `data/wow/playable-class/${classId}`,
		namespace: "static",
	});
}

export function PlayableClassMedia(this: WoWGameDataClient, classId: number) {
	return this.request({
		endpoint: `data/wow/media/playable-class/${classId}`,
		namespace: "static",
	});
}

export function PlayablePvPTalentSlot(
	this: WoWGameDataClient,
	classId: number,
) {
	return this.request({
		endpoint: `data/wow/playable-pvp-talent-slot/${classId}`,
		namespace: "static",
	});
}
