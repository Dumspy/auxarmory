import { WoWClient } from "..";

export function MediaSearch(this: WoWClient) {
	// TODO:
	return this.request({
		endpoint: `data/wow/media/search`,
		namespace: "static",
	});
}
