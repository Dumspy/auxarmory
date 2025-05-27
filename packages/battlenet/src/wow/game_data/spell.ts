import { WoWGameDataClient } from "..";

export function Spell(this: WoWGameDataClient, spellId: number) {
	return this.request({
		endpoint: `data/wow/spell/${spellId}`,
		namespace: "static",
	});
}

export function SpellMedia(this: WoWGameDataClient, spellId: number) {
	return this.request({
		endpoint: `data/wow/media/spell/${spellId}`,
		namespace: "static",
	});
}

export function SpellSearch(this: WoWGameDataClient) {
	// TODO:
	return this.request({
		endpoint: `data/wow/search/spell`,
		namespace: "static",
	});
}
