import type { Job } from "bullmq";

import { ApplicationClient, localeToString } from "@auxarmory/battlenet";
import { dbClient } from "@auxarmory/db";

import type { JobPayloads, JobTypes } from "../types";
import { env } from "../env";

export async function processGamedataSync(
	job: Job<JobPayloads[typeof JobTypes.SYNC_GAMEDATA]>,
) {
	const client = new ApplicationClient({
		clientId: env.BATTLENET_CLIENT_ID,
		clientSecret: env.BATTLENET_CLIENT_SECRET,
		region: env.BATTLENET_REGION,
	});

	try {
		await job.updateProgress(0);
		const classes = await client.wow.PlayableClassIndex();
		if (!classes.success) {
			throw new Error("Failed to fetch playable classes");
		}

		await dbClient.class.createMany({
			data: classes.data.classes.map((c) => ({
				id: c.id,
				name: localeToString(c.name) ?? "",
			})),
			skipDuplicates: true,
		});

		await job.updateProgress(50);

		const races = await client.wow.PlayableRaceIndex();
		if (!races.success) {
			throw new Error("Failed to fetch playable races");
		}

		await dbClient.race.createMany({
			data: races.data.races.map((r) => ({
				id: r.id,
				name: localeToString(r.name) ?? "",
			})),
			skipDuplicates: true,
		});

		await job.updateProgress(100);

		return {
			success: true,
			processedAt: new Date().toISOString(),
		};
	} catch (error) {
		console.error(`Failed to sync game data for ${job.id}:`, error);
		throw error;
	}
}
