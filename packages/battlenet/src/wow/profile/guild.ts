import { WoWClient } from "..";

export function Guild(this: WoWClient, realmSlug: string, nameSlug: string) {
	return this.request({
		endpoint: `data/wow/guild/${realmSlug}/${nameSlug}`,
		namespace: "profile",
	});
}

export function GuildActivity(
	this: WoWClient,
	realmSlug: string,
	nameSlug: string,
) {
	return this.request({
		endpoint: `data/wow/guild/${realmSlug}/${nameSlug}/activity`,
		namespace: "profile",
	});
}

export function GuildAchievements(
	this: WoWClient,
	realmSlug: string,
	nameSlug: string,
) {
	return this.request({
		endpoint: `data/wow/guild/${realmSlug}/${nameSlug}/achievements`,
		namespace: "profile",
	});
}

export function GuildRoster(
	this: WoWClient,
	realmSlug: string,
	nameSlug: string,
) {
	return this.request({
		endpoint: `data/wow/guild/${realmSlug}/${nameSlug}/roster`,
		namespace: "profile",
	});
}
