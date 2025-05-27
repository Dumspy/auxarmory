import { WoWGameDataClient } from "..";

export function JournalExpansionsIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/journal-expansion/index`,
		namespace: "static",
	});
}

export function JournalExpansions(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/journal-expansion/${id}`,
		namespace: "static",
	});
}

export function JournalEncounterIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/journal-encounter/index`,
		namespace: "static",
	});
}

export function JournalEncounter(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/journal-encounter/${id}`,
		namespace: "static",
	});
}

export function JournalEncounterSearch(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/search/journal-encounter`,
		namespace: "static",
	});
}

export function JournalInstanceIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/journal-instance/index`,
		namespace: "static",
	});
}

export function JournalInstance(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/journal-instance/${id}`,
		namespace: "static",
	});
}

export function JournalInstanceMedia(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/journal-instance/${id}`,
		namespace: "static",
	});
}
