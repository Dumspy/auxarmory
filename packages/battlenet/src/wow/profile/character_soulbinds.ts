import { WoWClient } from "..";

export function CharacterSoulbinds(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/soulbinds`,
		namespace: "profile",
	});
}
