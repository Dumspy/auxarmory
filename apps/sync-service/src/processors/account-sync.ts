import type { Job } from "bullmq";

import { AccountClient, localeToString } from "@auxarmory/battlenet";
import { dbClient } from "@auxarmory/db";

import type { JobPayloads } from "../types";
import { SyncServiceClient } from "../client";
import { JobPayloadSchemas, JobTypes } from "../types";

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

	if (account.bnetExpiresAt < new Date()) {
		throw new Error(
			`Account with ID ${accountId} has expired Battle.net access`,
		);
	}

	const syncServiceClient = new SyncServiceClient();

	const apiClient = new AccountClient({
		accessToken: account.bnetAccessToken,
		region: region,
	});

	console.log(`Processing account data sync for ${accountId} (${region})`);

	try {
		const accountProfile = await apiClient.wow.AccountProfileSummary();
		if (!accountProfile.success) {
			throw new Error(`Failed to fetch account profile for ${accountId}`);
		}

		const characters = accountProfile.data.wow_accounts.flatMap(
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

			const realmData = {
				name: character.realm.name
					? (localeToString(character.realm.name) ?? "Unknown Realm")
					: "Unknown Realm",
				slug: character.realm.slug,
			};

			await dbClient.realm.upsert({
				where: { id: character.realm.id },
				create: {
					id: character.realm.id,
					region,
					...realmData,
				},
				update: realmData,
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

		{
			/* Todo pass updatedAt/Created at to sync-character job to cleanup old characters that are no longer existing */
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
