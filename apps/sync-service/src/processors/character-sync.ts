import type { Job } from "bullmq";

import { ApplicationClient } from "@auxarmory/battlenet";
import { dbClient } from "@auxarmory/db";

import type { JobPayloads } from "../types";
import { env } from "../env";
import { JobPayloadSchemas, JobTypes } from "../types";

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
		// Update job progress
		await job.updateProgress(10);

		const character = await apiClient.wow.CharacterProfileSummary(
			realmSlug,
			characterName,
		);


		if (character.guild) {
			await dbClient.guild.upsert({
				where: { id: character.guild.id },
				create: {
					id: character.guild.id,
					name: character.guild.name,
					slug: "", // TODO
					realmId: character.guild.realm.id,
				},

				update: {
					name: character.guild.name,
				},
			});
		}

		await job.updateProgress(50);

		await dbClient.character.upsert({
			where: { id: character.id },
			create: {
				id: character.id,
				name: character.name,
				gender: character.gender.type,
				level: character.level,
				averageItemLevel: character.average_item_level,
				equippedItemLevel: character.equipped_item_level,
				lastLogin: new Date(character.last_login_timestamp),

				faction: character.faction.type,
				raceId: character.race.id,
				classId: character.character_class.id,

				realmId: character.realm.id,
				guildId: character.guild?.id,

				accountId: account.id,
			},
			update: {
				name: character.name,
				gender: character.gender.type,
				level: character.level,
				averageItemLevel: character.average_item_level,
				equippedItemLevel: character.equipped_item_level,
				lastLogin: new Date(character.last_login_timestamp),

				faction: character.faction.type,
				raceId: character.race.id,
				classId: character.character_class.id,

				realmId: character.realm.id,
				guildId: character.guild?.id,
			},
		});

		await job.updateProgress(100);

		console.log(`Successfully synced character data for ${characterName}`);

		return {
			success: true,
			characterId: character.id,
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
