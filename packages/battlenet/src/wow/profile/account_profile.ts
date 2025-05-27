import { WoWProfileClient } from "..";

export function AccountProfileSummary(this: WoWProfileClient) {
	return this.request({
		endpoint: `profile/user/wow`,
	});
}

export function ProtectedCharacterProfileSummary(
	this: WoWProfileClient,
	realmId: number,
	characterId: number,
) {
	return this.request({
		endpoint: `profile/user/wow/protected-character/${realmId}-${characterId}`,
	});
}

export function AccountCollectionIndex(this: WoWProfileClient) {
	return this.request({
		endpoint: `profile/user/wow/collections/index`,
	});
}

export function AccountHeirloomsCollectionSummary(this: WoWProfileClient) {
	return this.request({
		endpoint: `profile/user/wow/collections/heirlooms`,
	});
}

export function AccountMountsCollectionSummary(this: WoWProfileClient) {
	return this.request({
		endpoint: `profile/user/wow/collections/mounts`,
	});
}

export function AccountPetsCollectionSummary(this: WoWProfileClient) {
	return this.request({
		endpoint: `profile/user/wow/collections/pets`,
	});
}

export function AccountToysCollectionSummary(this: WoWProfileClient) {
	return this.request({
		endpoint: `profile/user/wow/collections/toys`,
	});
}

export function AccountTransmogCollectionSummary(this: WoWProfileClient) {
	return this.request({
		endpoint: `profile/user/wow/collections/transmogs`,
	});
}
