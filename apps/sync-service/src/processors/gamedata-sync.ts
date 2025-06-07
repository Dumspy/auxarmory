import type { Job } from "bullmq";

import { ApplicationClient, localeToString } from "@auxarmory/battlenet";
import { dbClient } from "@auxarmory/db";

import type { JobPayloads, JobTypes } from "../types";
import { InstanceTypeEnum } from "../../../../packages/db/generated/prisma";
import { env } from "../env";

export async function processGamedataSync(
	job: Job<JobPayloads[typeof JobTypes.SYNC_GAMEDATA]>,
) {
	const apiClient = new ApplicationClient({
		clientId: env.BATTLENET_CLIENT_ID,
		clientSecret: env.BATTLENET_CLIENT_SECRET,
		region: env.BATTLENET_REGION,
	});

	try {
		const classIndex = await apiClient.wow.PlayableClassIndex();
		if (classIndex.success) {
			await dbClient.class.createMany({
				data: classIndex.data.classes.map((c) => ({
					id: c.id,
					name: localeToString(c.name) ?? "",
				})),
				skipDuplicates: true,
			});
		}

		const raceIndex = await apiClient.wow.PlayableRaceIndex();
		if (raceIndex.success) {
			await dbClient.race.createMany({
				data: raceIndex.data.races.map((r) => ({
					id: r.id,
					name: localeToString(r.name) ?? "",
				})),
				skipDuplicates: true,
			});
		}

		const journalExpansionsIndex =
			await apiClient.wow.JournalExpansionsIndex();
		if (journalExpansionsIndex.success) {
			await dbClient.journalExpansion.createMany({
				data: journalExpansionsIndex.data.tiers.map((e) => ({
					id: e.id,
					name: localeToString(e.name) ?? "",
				})),
				skipDuplicates: true,
			});

			const currentSeason = journalExpansionsIndex.data.tiers.find(
				(e) => localeToString(e.name) === "Current Season",
			);
			if (currentSeason) {
				const journalExpansions = await apiClient.wow.JournalExpansions(
					currentSeason.id,
				);
				if (journalExpansions.success) {
					for (const raid of journalExpansions.data.raids) {
						const raidDate = {
							name: localeToString(raid.name) ?? "",
							instanceType: InstanceTypeEnum.RAID,
							expansions: {
								connect: [{ id: journalExpansions.data.id }],
							},
						};

						await dbClient.journalInstance.upsert({
							where: { id: raid.id },
							create: {
								id: raid.id,
								...raidDate,
							},
							update: raidDate,
						});

						const journalEncounter =
							await apiClient.wow.JournalInstance(raid.id);
						console.log(`Processing raid:`, journalEncounter);
						if (journalEncounter.success) {
							for (const encounter of journalEncounter.data
								.encounters) {
								await dbClient.journalEncounter.upsert({
									where: { id: encounter.id },
									create: {
										id: encounter.id,
										name:
											localeToString(encounter.name) ??
											"",
										journalInstance: {
											connect: { id: raid.id },
										},
									},
									update: {
										name:
											localeToString(encounter.name) ??
											"",
									},
								});
							}
						}
					}
				}
			}
		}

		return {
			success: true,
			processedAt: new Date().toISOString(),
		};
	} catch (error) {
		console.error(`Failed to sync game data for ${job.id}:`, error);
		throw error;
	}
}
