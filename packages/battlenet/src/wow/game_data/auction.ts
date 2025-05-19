import { WoWClient } from "..";

export function Auctions(this: WoWClient, realm: number) {
	return this.request({
		endpoint: `data/wow/connected-realm/${realm}/auctions`,
		namespace: "dynamic",
	});
}

export function AuctionCommodities(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/auctions/commodities`,
		namespace: "dynamic",
	});
}
