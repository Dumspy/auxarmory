import type { WoWGameDataClient } from "..";

export function PlayableRaceIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/playable-race/index`,
		namespace: "static",
	});
}

export function PlayableRace(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/playable/index/${id}`,
		namespace: "static",
	});
}
