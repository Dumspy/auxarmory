import { WoWClient } from "..";

export function PlayableSpecializationIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/playable-specialization/index`,
		namespace: "static",
	});
}

export function PlayableSpecialization(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/playable-specialization/${id}`,
		namespace: "static",
	});
}

export function PlayableSpecializationMedia(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/playable-specialization/${id}`,
		namespace: "static",
	});
}
