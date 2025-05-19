import { WoWClient } from "..";

export function ToyIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/toy/index`,
		namespace: "static",
	});
}

export function Toy(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/toy/${id}`,
		namespace: "static",
	});
}
