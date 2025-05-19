import { WoWClient } from "..";

export function GuildCrestIndex(this: WoWClient) {
	return this.request({
		endpoint: `data/wow/guild-crest/index`,
		namespace: "static",
	});
}

export function GuildCrestBorderMedia(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/guild-crest/border/${id}`,
		namespace: "static",
	});
}

export function GuildCrestsEmblemMedia(this: WoWClient, id: number) {
	return this.request({
		endpoint: `data/wow/media/guild-crest/emblem/${id}`,
		namespace: "static",
	});
}
