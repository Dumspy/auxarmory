import { WoWGameDataClient } from "..";

export function CharacterSoulbinds(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/soulbinds`,
		namespace: "profile",
	});
}
