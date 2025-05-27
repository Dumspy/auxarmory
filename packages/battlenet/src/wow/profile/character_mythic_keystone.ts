import { WoWGameDataClient } from "..";

export function CharacterMythicKeystoneProfileIndex(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/mythic-keystone-profile`,
		namespace: "profile",
	});
}

export function CharacterMythicKeystoneSeason(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
	seasonId: number,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/mythic-keystone-profile/season/${seasonId}`,
		namespace: "profile",
	});
}
