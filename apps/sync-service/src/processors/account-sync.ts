import type { Job } from "bullmq";

import { AccountClient, localeToString } from "@auxarmory/battlenet";
import { dbClient } from "@auxarmory/db";

import type { JobPayloads } from "../types.js";
import { SyncServiceClient } from "../client.js";
import { JobPayloadSchemas, JobTypes } from "../types.js";

export async function processAccountDataSync(
	job: Job<JobPayloads[typeof JobTypes.SYNC_ACCOUNT_DATA]>,
) {
	const { accountId, region } = JobPayloadSchemas[
		JobTypes.SYNC_ACCOUNT_DATA
	].parse(job.data);

	const account = await dbClient.account.findUnique({
		where: { id: accountId },
	});

	if (!account) {
		throw new Error(`Account with ID ${accountId} not found`);
	}

	if (account.bnet_expires_at < new Date()) {
		throw new Error(
			`Account with ID ${accountId} has expired Battle.net access`,
		);
	}

	const syncServiceClient = new SyncServiceClient();

	const apiClient = new AccountClient({
		accessToken: account.bnet_access_token,
		region: region,
	});

	console.log(`Processing account data sync for ${accountId} (${region})`);

	try {
		const accountProfile = await apiClient.wow.AccountProfileSummary();

		const characters = accountProfile.wow_accounts.flatMap(
			(wowAccount) => wowAccount.characters,
		);
		// .filter(
		// 	(character) => character.level >= 70
		// );

		console.log(
			`Found ${characters.length} characters for account ${accountId}`,
		);

		let progress = 10;
		await job.updateProgress(progress);

		for (const character of characters) {
			console.log(
				`Processing character ${character.name} (${character.id})`,
			);

			await dbClient.realm.upsert({
				where: { id: character.realm.id },
				create: {
					id: character.realm.id,
					name:
						localeToString(character.realm.name) ?? "Unknown Realm",
					slug: character.realm.slug,
					region,
				},
				update: {
					name:
						localeToString(character.realm.name) ?? "Unknown Realm",
					slug: character.realm.slug,
				},
			});

			await syncServiceClient.addJob("sync-character-data", {
				accountId: accountId,
				region: region,
				realmSlug: character.realm.slug,
				characterName: character.name,
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
