import { WoWGameDataClient } from "..";

export function Auctions(this: WoWGameDataClient, realm: number) {
	return this.request({
		endpoint: `data/wow/connected-realm/${realm}/auctions`,
		namespace: "dynamic",
	});
}

export function AuctionCommodities(this: WoWGameDataClient) {
	return this.request({
		endpoint: `data/wow/auctions/commodities`,
		namespace: "dynamic",
	});
}
