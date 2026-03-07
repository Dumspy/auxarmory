import { createFlowProducer, createQueue } from '../../../queue.js'
import { defineJob } from '../../../registry.js'

import { ensureWowStaticWeeklyRegionFlow } from './flow.js'
import {
	completeSyncRunFailure,
	completeSyncRunSuccess,
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
import type { WowStaticWeeklyCoordinatorJobPayload } from '../utils.js'

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
		force: false,
	} satisfies WowStaticWeeklyCoordinatorJobPayload,
	handler: async function handleSyncWowStaticWeeklyCoordinator(job) {
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

		let createdCount = 0
		let forcedCount = 0
		let recoveredCount = 0
		let retriedCount = 0
		let skippedCount = 0
		const queue = createQueue()
		const flowProducer = createFlowProducer()

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

				if (!job.data.force && !dueCheck.due) {
					skippedCount += 1
					continue
				}

				const result = await ensureWowStaticWeeklyRegionFlow({
					queue,
					flowProducer,
					data: {
						region,
						resetKey: dueCheck.resetKey,
						triggeredBy: job.data.triggeredBy,
					},
					force: job.data.force,
				})

				if (result.created) {
					if (result.forced) {
						forcedCount += 1
					} else {
						createdCount += 1
					}
				}

				if (result.recovered) {
					recoveredCount += 1
				}

				retriedCount += result.retriedCount
			}

			await completeSyncRunSuccess({
				runId,
				provider: SYNC_PROVIDER,
				domain: SYNC_DOMAIN,
				entity: WOW_STATIC_WEEKLY_COORDINATOR_ENTITY,
				insertedCount: createdCount + forcedCount,
				skippedCount,
				metadata: {
					regions: WOW_SYNC_REGIONS,
					createdCount,
					forcedCount,
					recoveredCount,
					retriedCount,
					skippedCount,
				},
			})

			return {
				ok: true,
				createdCount,
				forcedCount,
				recoveredCount,
				retriedCount,
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
			await flowProducer.close()
			await queue.close()
		}
	},
})
