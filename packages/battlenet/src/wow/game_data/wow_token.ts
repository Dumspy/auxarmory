import { WoWClient } from "..";

export function WoWTokenIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/token/index`,
		namespace: "dynamic",
	});
}
