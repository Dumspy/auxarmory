import { WoWClient } from "..";

export function CharacterEquipmentSummary(
	this: WoWClient,
	realmSlug: string,
	characterName: string,
) {
	return this.request({
		endpoint: `profile/wow/character/${realmSlug}/${characterName}/equipment`,
		namespace: "profile",
	});
}
