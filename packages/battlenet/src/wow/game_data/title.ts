import { WoWGameDataClient } from "..";

export function TitleIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/title/index`,
		namespace: "static",
	});
}

export function Title(this: WoWGameDataClient, id: number) {
	return this.request({
		endpoint: `data/wow/title/${id}`,
		namespace: "static",
	});
}
