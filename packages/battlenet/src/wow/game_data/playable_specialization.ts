import { WoWGameDataClient } from "..";

export function PlayableSpecializationIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/playable-specialization/index`,
		namespace: "static",
	});
}

export function PlayableSpecialization(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/playable-specialization/${id}`,
		namespace: "static",
	});
}

export function PlayableSpecializationMedia(
	this: WoWGameDataClient,
	id: number,
) {
	return this.request({
		endpoint: `data/wow/media/playable-specialization/${id}`,
		namespace: "static",
	});
}
