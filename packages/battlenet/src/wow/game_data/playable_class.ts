import { WoWClient } from "..";

export function PlayableClassIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/playable-class/index`,
		namespace: "static",
	});
}

export function PlayableClass(this: WoWClient, classId: number) {
	return this.request({
		endpoint: `data/wow/playable-class/${classId}`,
		namespace: "static",
	});
}

export function PlayableClassMedia(this: WoWClient, classId: number) {
	return this.request({
		endpoint: `data/wow/media/playable-class/${classId}`,
		namespace: "static",
	});
}

export function PlayablePvPTalentSlot(this: WoWClient, classId: number) {
	return this.request({
		endpoint: `data/wow/playable-pvp-talent-slot/${classId}`,
		namespace: "static",
	});
}
