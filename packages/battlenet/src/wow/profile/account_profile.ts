import { WoWClient } from "..";

export function AccountProfileSummary(this: WoWClient) {
	return this.request({
		endpoint: `profile/user/wow`,
		namespace: "profile",
	});
}

export function ProtectedCharacterProfileSummary(
	this: WoWClient,
	realmId: number,
	characterId: number,
) {
	return this.request({
		endpoint: `profile/user/wow/protected-character/${realmId}-${characterId}`,
		namespace: "profile",
	});
}

export function AccountCollectionIndex(this: WoWClient) {
	return this.request({
		endpoint: `profile/user/wow/collections/index`,
		namespace: "profile",
	});
}

export function AccountHeirloomsCollectionSummary(this: WoWClient) {
	return this.request({
		endpoint: `profile/user/wow/collections/heirlooms`,
		namespace: "profile",
	});
}

export function AccountMountsCollectionSummary(this: WoWClient) {
	return this.request({
		endpoint: `profile/user/wow/collections/mounts`,
		namespace: "profile",
	});
}

export function AccountPetsCollectionSummary(this: WoWClient) {
	return this.request({
		endpoint: `profile/user/wow/collections/pets`,
		namespace: "profile",
	});
}

export function AccountToysCollectionSummary(this: WoWClient) {
	return this.request({
		endpoint: `profile/user/wow/collections/toys`,
		namespace: "profile",
	});
}

export function AccountTransmogCollectionSummary(this: WoWClient) {
	return this.request({
		endpoint: `profile/user/wow/collections/transmogs`,
		namespace: "profile",
	});
}
