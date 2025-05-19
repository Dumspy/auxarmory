import { WoWClient } from "..";

export function AzeriteIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/azerite-essence/index`,
		namespace: "static",
	});
}

export function Azerite(this: WoWClient, essenceId: string) {
	return this.request({
		endpoint: `data/wow/azerite-essence/${essenceId}`,
		namespace: "static",
	});
}

export function AzeriteSearch(
	this: WoWClient,
	specilizationId?: number,
	page: number = 1,
) {
	// TODO: do order by properly
	return this.request({
		endpoint: `data/wow/search/azerite-essence`,
		namespace: "static",
	});
}

export function AzeriteMedia(this: WoWClient, essenceId: string) {
	return this.request({
		endpoint: `data/wow/media/azerite-essence/${essenceId}`,
		namespace: "static",
	});
}
