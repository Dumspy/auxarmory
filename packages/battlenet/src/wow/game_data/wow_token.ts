import { WoWGameDataClient } from "..";

export function WoWTokenIndex(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/token/index`,
		namespace: "dynamic",
	});
}
