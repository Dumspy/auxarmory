import type { WoWGameDataClient } from "..";

export function MediaSearch(this: WoWGameDataClient) {
	// TODO:
	return this.request({
		endpoint: `data/wow/media/search`,
		namespace: "static",
	});
}
