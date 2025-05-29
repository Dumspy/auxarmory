import { Job } from "bullmq";
import { JobPayloads, JobPayloadSchemas, JobTypes } from "../types.js";
import { AccountClient } from "@auxarmory/battlenet";
import { dbClient } from "@auxarmory/db";

export async function processAccountDataSync(
	job: Job<JobPayloads[typeof JobTypes.SYNC_ACCOUNT_DATA]>,
) {
	const { accountId, region } = JobPayloadSchemas[JobTypes.SYNC_ACCOUNT_DATA].parse(job.data);

	const account = await dbClient.account.findUnique({
		where: { id: accountId },
	});

	if (!account) {
		throw new Error(`Account with ID ${accountId} not found`);
	}

	if (account.bnet_expires_at < new Date()) {
		throw new Error(`Account with ID ${accountId} has expired Battle.net access`,);
	}

	const apiClient = new AccountClient({
		accessToken: account.bnet_access_token,
		region: region,
	});

	console.log(`Processing account data sync for ${accountId} (${region})`);

	try {
		const accountProfile = await apiClient.wow.AccountProfileSummary();

		const characters = accountProfile.wow_accounts.flatMap((wowAccount) => wowAccount.characters,);

		console.log(
			`Found ${characters.length} characters for account ${accountId}`,
		);

		let progress = 10;
		await job.updateProgress(progress);

		for (const character of characters) {
			console.log(`Processing character ${character.name} (${character.id})`);

			const realm = await dbClient.realm.upsert({
				where: { id: character.realm.id },
				create: {
					id: character.realm.id,
					name: 'temp', // Placeholder, will be updated later
					slug: character.realm.slug,
					region,
				},
				update: {
					name: 'temp',
					slug: character.realm.slug,
				},
			});

			await dbClient.character.upsert({
				where: { id: character.id },
				create: {
					id: character.id,
					name: character.name,
					gender: character.gender.type,
					level: character.level,
					averageItemLevel: 0, // Placeholder, will be updated later
					equippedItemLevel: 0, // Placeholder, will be updated later

					faction: character.faction.type,
					race: 'BLOOD_ELF', // Placeholder, will be updated later
					class: 'WARRIOR', // Placeholder, will be updated later

					realmId: realm.id,
					guildId: null, // Placeholder, will be updated later
				},
				update: {
					name: character.name,
					gender: character.gender.type,
					level: character.level,

					faction: character.faction.type,
					race: 'BLOOD_ELF', // Placeholder, will be updated later
					class: 'WARRIOR', // Placeholder, will be updated later

					realmId: realm.id,
				}
			});

			progress += 90 / characters.length;
			await job.updateProgress(progress);
		}

		console.log(`Successfully synced account data for ${accountId}`);

			return {
				success: true,
			accountId,
			processedAt: new Date().toISOString(),
		};
	} catch (error) {
		console.error(`Failed to sync account data for ${accountId}:`, error);
		throw error;
	}
}
