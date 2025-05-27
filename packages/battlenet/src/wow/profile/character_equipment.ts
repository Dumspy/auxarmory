import { WoWGameDataClient } from "..";

export function CharacterEquipmentSummary(
	this: WoWGameDataClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/equipment`,
		namespace: "profile",
	});
}
