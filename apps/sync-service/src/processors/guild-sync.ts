import type { Job } from "bullmq";

import { ApplicationClient } from "@auxarmory/battlenet";
import { dbClient } from "@auxarmory/db";

import type { JobPayloads } from "../types";
import { JobPayloadSchemas, JobTypes } from "../types";
import { env } from "../env";

export async function processGuildSync(
    job: Job<JobPayloads[typeof JobTypes.SYNC_GUILD_DATA]>,
) {
    const jobData = JobPayloadSchemas[JobTypes.SYNC_GUILD_DATA].parse(job.data);

	const apiClient = new ApplicationClient({
		clientId: env.BATTLENET_CLIENT_ID,
		clientSecret: env.BATTLENET_CLIENT_SECRET,
		region: jobData.region,
	});

    try {
        const guild = await apiClient.wow.Guild(jobData.realm.slug, jobData.guild.slug);

		if (!guild.success) {
			throw new Error(`Failed to fetch guild data: ${jobData.guild.slug} on realm ${jobData.realm.slug}`);
		}

        const guildData = {
            name: guild.data.name,
			slug: jobData.guild.slug,
            memberCount: guild.data.member_count,
            realmId: jobData.realm.id,
        }

        await dbClient.guild.upsert({
            where: { id: guild.data.id },
            create: {
                id: guild.data.id,
                ...guildData
            },
            update: {
                ...guildData
            }
        });

        return {
            success: true,
            guildId: guild.data.id,
            processedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error(`Failed to sync guild data for ${jobData.guild.id}:`, error);
        throw error;
    }
}
