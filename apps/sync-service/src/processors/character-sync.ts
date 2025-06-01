import type { Job } from "bullmq";

import { ApplicationClient, localeToString } from "@auxarmory/battlenet";
import { dbClient } from "@auxarmory/db";

import type { JobPayloads } from "../types";
import { env } from "../env";
import { JobPayloadSchemas, JobTypes } from "../types";
import { SyncServiceClient } from "../client";

export async function processCharacterDataSync(
	job: Job<JobPayloads[typeof JobTypes.SYNC_CHARACTER_DATA]>,
) {
	const { accountId, region, characterName, realmSlug } = JobPayloadSchemas[
		JobTypes.SYNC_CHARACTER_DATA
	].parse(job.data);

	const account = await dbClient.account.findUnique({
		where: { id: accountId },
	});

	if (!account) {
		throw new Error(`Account with ID ${accountId} not found`);
	}

	const apiClient = new ApplicationClient({
		clientId: env.BATTLENET_CLIENT_ID,
		clientSecret: env.BATTLENET_CLIENT_SECRET,
		region: region,
	});

	console.log(`Processing account data sync for ${accountId} (${region})`);

	try {
		await job.updateProgress(10);

		const characterProfile = await apiClient.wow.CharacterProfileSummary(
			realmSlug,
			characterName.toLowerCase(),
		);

		if (characterProfile.guild) {
			const syncServiceClient = new SyncServiceClient();

			await syncServiceClient.addJob(JobTypes.SYNC_GUILD_DATA, {
				guild: {
					id: characterProfile.guild.id,
					slug: characterProfile.guild.name.toLowerCase().replace(/\s+/g, "-"),
				},
				realm: {
					id: characterProfile.guild.realm.id,
					slug: characterProfile.guild.realm.slug,
				},
				region,
			});
		}

		const { current_mythic_rating } = await apiClient.wow.CharacterMythicKeystoneProfileIndex(
			realmSlug,
			characterName.toLowerCase(),
		)

		await job.updateProgress(50);

		const characterMedia = await apiClient.wow.CharacterMediaSummary(
			realmSlug,
			characterName.toLowerCase(),
		);

		const avatarUrl = characterMedia.assets.find(
			(asset) => asset.key === "avatar",
		)?.value;

		const character = {
			name: characterProfile.name,
			gender: characterProfile.gender.type,
			level: characterProfile.level,
			averageItemLevel: characterProfile.average_item_level,
			equippedItemLevel: characterProfile.equipped_item_level,
			lastLogin: new Date(characterProfile.last_login_timestamp),
			activeSpec: characterProfile.active_spec?.name ? localeToString(characterProfile.active_spec.name) : undefined,
			avatarUrl,

			faction: characterProfile.faction.type,
			raceId: characterProfile.race.id,
			classId: characterProfile.character_class.id,

			realmId: characterProfile.realm.id,
			guildId: characterProfile.guild?.id,

			mythicRating: current_mythic_rating?.rating,
			mythicRatingColor: current_mythic_rating ? `${current_mythic_rating.color.r}, ${current_mythic_rating.color.g}, ${current_mythic_rating.color.b}, ${current_mythic_rating.color.a}` : undefined,
		};

		await dbClient.character.upsert({
			where: { id: characterProfile.id },
			create: {
				id: characterProfile.id,
				accountId: account.id,
				...character,
			},
			update: {
				...character,
			},
		});

		await job.updateProgress(100);

		console.log(`Successfully synced character data for ${characterName}`);

		return {
			success: true,
			characterId: characterProfile.id,
			processedAt: new Date().toISOString(),
		};
	} catch (error) {
		console.error(
			`Failed to sync character data for ${characterName}:`,
			error,
		);
		throw error;
	}
}
