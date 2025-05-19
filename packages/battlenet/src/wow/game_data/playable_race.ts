import { WoWClient } from "..";

export function PlayableRaceIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/playable-race/index`,
		namespace: "static",
	});
}

export function PlayableRace(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/playable/index/${id}`,
		namespace: "static",
	});
}
