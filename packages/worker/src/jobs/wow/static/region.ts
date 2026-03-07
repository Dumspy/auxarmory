import { defineJob } from '../../../registry.js'

import {
	completeSyncRunFailure,
	completeSyncRunSuccess,
	SYNC_DOMAIN,
	SYNC_PROVIDER,
	toErrorPayload,
	startSyncRun,
	WOW_STATIC_WEEKLY_REGION_ENTITY,
	wowStaticWeeklyRegionJobPayloadSchema,
} from '../utils.js'
import type { WowStaticWeeklyRegionJobPayload } from '../utils.js'

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

		try {
			await completeSyncRunSuccess({
				runId,
				provider: SYNC_PROVIDER,
				domain: SYNC_DOMAIN,
				entity: WOW_STATIC_WEEKLY_REGION_ENTITY,
				region: job.data.region,
				resetKey: job.data.resetKey,
				insertedCount: 0,
				metadata: {
					resetKey: job.data.resetKey,
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
		}
	},
})
