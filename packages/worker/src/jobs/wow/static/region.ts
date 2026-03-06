import { createQueue } from '../../../queue.js'
import { defineJob } from '../../../registry.js'

import {
	completeSyncRunFailure,
	completeSyncRunSuccess,
	formatWowStaticWeeklyEntityJobId,
	SYNC_DOMAIN,
	SYNC_PROVIDER,
	toErrorPayload,
	startSyncRun,
	WOW_STATIC_WEEKLY_REGION_ENTITY,
	wowStaticWeeklyRegionJobPayloadSchema,
} from '../utils.js'
import type { WowStaticWeeklyRegionJobPayload } from '../utils.js'
import { syncWowStaticWeeklyConnectedRealmsJob } from './connected_realms.js'
import { syncWowStaticWeeklyPlayableClassesJob } from './playable_classes.js'
import { syncWowStaticWeeklyPlayableRacesJob } from './playable_races.js'
import { syncWowStaticWeeklyPlayableSpecializationsJob } from './playable_specializations.js'
import { syncWowStaticWeeklyProfessionsJob } from './professions.js'
import { syncWowStaticWeeklyRealmsJob } from './realms.js'

export const syncWowStaticWeeklyRegionJob = defineJob({
	name: 'sync:wow:static:weekly:region',
	description: 'Sync WoW static cache for one region weekly window',
	allowManualRun: true,
	schema: wowStaticWeeklyRegionJobPayloadSchema,
	data: {
		region: 'us',
		resetKey: 'us:1970-01-01T00:00',
		triggeredBy: 'scheduler',
	} satisfies WowStaticWeeklyRegionJobPayload,
	handler: async function handleSyncWowStaticWeeklyRegion(job) {
		const { runId } = await startSyncRun({
			provider: SYNC_PROVIDER,
			domain: SYNC_DOMAIN,
			entity: WOW_STATIC_WEEKLY_REGION_ENTITY,
			region: job.data.region,
			mode: 'weekly',
			triggeredBy: job.data.triggeredBy,
			jobName: job.name,
			jobId: String(job.id ?? ''),
			scheduledFor: job.timestamp ? new Date(job.timestamp) : undefined,
			metadata: {
				resetKey: job.data.resetKey,
			},
		})
		const queue = createQueue()

		try {
			const entityJobs = [
				syncWowStaticWeeklyConnectedRealmsJob,
				syncWowStaticWeeklyRealmsJob,
				syncWowStaticWeeklyPlayableClassesJob,
				syncWowStaticWeeklyPlayableRacesJob,
				syncWowStaticWeeklyPlayableSpecializationsJob,
				syncWowStaticWeeklyProfessionsJob,
			]

			for (const entityJob of entityJobs) {
				await queue.add(
					entityJob.name,
					{
						region: job.data.region,
						resetKey: job.data.resetKey,
						triggeredBy: job.data.triggeredBy,
					},
					{
						jobId: formatWowStaticWeeklyEntityJobId(
							entityJob.name.split(':').at(-1) ?? entityJob.name,
							job.data.region,
							job.data.resetKey,
						),
					},
				)
			}

			await completeSyncRunSuccess({
				runId,
				provider: SYNC_PROVIDER,
				domain: SYNC_DOMAIN,
				entity: WOW_STATIC_WEEKLY_REGION_ENTITY,
				region: job.data.region,
				resetKey: job.data.resetKey,
				insertedCount: entityJobs.length,
				metadata: {
					queuedEntities: entityJobs.map((item) => item.name),
				},
			})

			return {
				ok: true,
				region: job.data.region,
				resetKey: job.data.resetKey,
			}
		} catch (error) {
			await completeSyncRunFailure({
				runId,
				provider: SYNC_PROVIDER,
				domain: SYNC_DOMAIN,
				entity: WOW_STATIC_WEEKLY_REGION_ENTITY,
				region: job.data.region,
				errorMessage:
					error instanceof Error ? error.message : String(error),
				errorPayload: toErrorPayload(error),
			})

			throw error
		} finally {
			await queue.close()
		}
	},
})
