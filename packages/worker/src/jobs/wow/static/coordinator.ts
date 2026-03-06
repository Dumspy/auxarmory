import { createQueue } from '../../../queue.js'
import { defineJob } from '../../../registry.js'

import { syncWowStaticWeeklyRegionJob } from './region.js'
import {
	completeSyncRunFailure,
	completeSyncRunSuccess,
	formatWowStaticWeeklyRegionJobId,
	getSyncStateByScope,
	isRegionWeeklySyncDue,
	SYNC_DOMAIN,
	SYNC_PROVIDER,
	toErrorPayload,
	WOW_SYNC_REGIONS,
	WOW_STATIC_WEEKLY_COORDINATOR_ENTITY,
	WOW_STATIC_WEEKLY_REGION_ENTITY,
	wowStaticWeeklyCoordinatorJobPayloadSchema,
	startSyncRun,
} from '../utils.js'
import type {
	SyncRunTrigger,
	WowStaticWeeklyCoordinatorJobPayload,
} from '../utils.js'

export const syncWowStaticWeeklyCoordinatorJob = defineJob({
	name: 'sync:wow:static:weekly:coordinator',
	description: 'Check per-region reset windows and enqueue due weekly syncs',
	allowManualRun: true,
	schema: wowStaticWeeklyCoordinatorJobPayloadSchema,
	schedule: {
		id: 'sync-wow-static-weekly-coordinator',
		everyMs: 30 * 60 * 1000,
	},
	data: {
		triggeredBy: 'scheduler',
	} satisfies WowStaticWeeklyCoordinatorJobPayload,
	handler: async function handleSyncWowStaticWeeklyCoordinator(job) {
		const queue = createQueue()
		const { runId } = await startSyncRun({
			provider: SYNC_PROVIDER,
			domain: SYNC_DOMAIN,
			entity: WOW_STATIC_WEEKLY_COORDINATOR_ENTITY,
			mode: 'weekly',
			triggeredBy: job.data.triggeredBy,
			jobName: job.name,
			jobId: String(job.id ?? ''),
			scheduledFor: job.timestamp ? new Date(job.timestamp) : undefined,
		})

		let enqueuedCount = 0
		let skippedCount = 0

		try {
			for (const region of WOW_SYNC_REGIONS) {
				const state = await getSyncStateByScope({
					provider: SYNC_PROVIDER,
					domain: SYNC_DOMAIN,
					entity: WOW_STATIC_WEEKLY_REGION_ENTITY,
					region,
				})

				const dueCheck = isRegionWeeklySyncDue({
					region,
					lastResetKey: state?.lastResetKey,
				})

				if (!dueCheck.due) {
					skippedCount += 1
					continue
				}

				await queue.add(
					syncWowStaticWeeklyRegionJob.name,
					{
						region,
						resetKey: dueCheck.resetKey,
						triggeredBy: 'scheduler' satisfies SyncRunTrigger,
					},
					{
						jobId: formatWowStaticWeeklyRegionJobId(
							region,
							dueCheck.resetKey,
						),
					},
				)

				enqueuedCount += 1
			}

			await completeSyncRunSuccess({
				runId,
				provider: SYNC_PROVIDER,
				domain: SYNC_DOMAIN,
				entity: WOW_STATIC_WEEKLY_COORDINATOR_ENTITY,
				insertedCount: enqueuedCount,
				skippedCount,
				metadata: {
					regions: WOW_SYNC_REGIONS,
				},
			})

			return {
				ok: true,
				enqueuedCount,
				skippedCount,
			}
		} catch (error) {
			await completeSyncRunFailure({
				runId,
				provider: SYNC_PROVIDER,
				domain: SYNC_DOMAIN,
				entity: WOW_STATIC_WEEKLY_COORDINATOR_ENTITY,
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
