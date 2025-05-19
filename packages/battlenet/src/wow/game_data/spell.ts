import { WoWClient } from "..";

export function Spell(this: WoWClient, spellId: number) {
	return this.request({
		endpoint: `data/wow/spell/${spellId}`,
		namespace: "static",
	});
}

export function SpellMedia(this: WoWClient, spellId: number) {
	return this.request({
		endpoint: `data/wow/media/spell/${spellId}`,
		namespace: "static",
	});
}

export function SpellSearch(this: WoWClient) {
	// TODO:
	return this.request({
		endpoint: `data/wow/search/spell`,
		namespace: "static",
	});
}
