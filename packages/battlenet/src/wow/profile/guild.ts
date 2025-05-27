import { WoWGameDataClient } from "..";

export function Guild(this: WoWGameDataClient, realmSlug: string, nameSlug: string) {
	return this.request({
		endpoint: `data/wow/guild/${realmSlug}/${nameSlug}`,
		namespace: "profile",
	});
}

export function GuildActivity(
	this: WoWGameDataClient,
	realmSlug: string,
	nameSlug: string,
) {
	return this.request({
		endpoint: `data/wow/guild/${realmSlug}/${nameSlug}/activity`,
		namespace: "profile",
	});
}

export function GuildAchievements(
	this: WoWGameDataClient,
	realmSlug: string,
	nameSlug: string,
) {
	return this.request({
		endpoint: `data/wow/guild/${realmSlug}/${nameSlug}/achievements`,
		namespace: "profile",
	});
}

export function GuildRoster(
	this: WoWGameDataClient,
	realmSlug: string,
	nameSlug: string,
) {
	return this.request({
		endpoint: `data/wow/guild/${realmSlug}/${nameSlug}/roster`,
		namespace: "profile",
	});
}
