import { WoWClient } from "..";

export function Creature(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/creatue/${id}`,
		namespace: "static",
	});
}

export function CreatureSearch(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/search/creature`,
		namespace: "static",
	});
}

export function CreatureMedia(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/creature-display/${id}`,
		namespace: "static",
	});
}

export function CreatueFamilyIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/creature-family/index`,
		namespace: "static",
	});
}

export function CreatueFamily(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/creature-family/${id}`,
		namespace: "static",
	});
}

export function CreatueFamilyMedia(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/creature-family/${id}`,
		namespace: "static",
	});
}

export function CreatureTypeIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/creature-type/index`,
		namespace: "static",
	});
}

export function CreatureType(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/creature-type/${id}`,
		namespace: "static",
	});
}
