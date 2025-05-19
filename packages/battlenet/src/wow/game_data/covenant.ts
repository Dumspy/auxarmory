import { WoWClient } from "..";

export function CovenantIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/covenant/index`,
		namespace: "static",
	});
}

export function Covenant(this: WoWClient, covenantId: number) {
	return this.request({
		endpoint: `data/wow/covenant/${covenantId}`,
		namespace: "static",
	});
}

export function CovenantMedia(this: WoWClient, covenantId: number) {
	return this.request({
		endpoint: `data/wow/media/covenant/${covenantId}`,
		namespace: "static",
	});
}

export function CovenantSoulbindIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/covenant/soulbind/index`,
		namespace: "static",
	});
}

export function CovenantSoulbind(this: WoWClient, soulbindId: number) {
	return this.request({
		endpoint: `data/wow/covenant/soulbind/${soulbindId}`,
		namespace: "static",
	});
}

export function CovenantConduitIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/covenant/conduit/index`,
		namespace: "static",
	});
}

export function CovenantConduit(this: WoWClient, conduitId: number) {
	return this.request({
		endpoint: `data/wow/covenant/conduit/${conduitId}`,
		namespace: "static",
	});
}
