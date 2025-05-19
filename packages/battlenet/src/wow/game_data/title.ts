import { WoWClient } from "..";

export function TitleIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/title/index`,
		namespace: "static",
	});
}

export function Title(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/title/${id}`,
		namespace: "static",
	});
}
