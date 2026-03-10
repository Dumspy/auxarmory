import { createQueue } from '../../queue.js'
import { enqueueJob } from '../../producer/index.js'
import { defineJob } from '../../registry.js'

import {
	completeSyncRunFailure,
	completeSyncRunSuccess,
	SYNC_PROVIDER,
	toErrorPayload,
	startSyncRun,
} from './utils.js'
import {
	formatWowProfileAccountJobId,
	WOW_PROFILE_ACCOUNT_COORDINATOR_ENTITY,
	WOW_PROFILE_ACCOUNT_ENTITY,
	WOW_PROFILE_SYNC_DOMAIN,
	wowProfileAccountCoordinatorJobPayloadSchema,
} from './profile_utils.js'
import { listWowLinkedBattlenetAccounts } from './profile_accounts.js'
import type { WowProfileAccountCoordinatorJobPayload } from './profile_utils.js'

export const syncWowProfileAccountCoordinatorJob = defineJob({
	name: 'sync:wow:profile:account:coordinator',
	description: 'Discover linked Battle.net accounts and enqueue roster sync jobs',
	allowManualRun: true,
	schema: wowProfileAccountCoordinatorJobPayloadSchema,
	data: {
		triggeredBy: 'manual',
		force: false,
	} satisfies WowProfileAccountCoordinatorJobPayload,
	handler: async function handleSyncWowProfileAccountCoordinator(job) {
		const scopeKey = job.data.userId ?? 'all-users'
		const { runId } = await startSyncRun({
			provider: SYNC_PROVIDER,
			domain: WOW_PROFILE_SYNC_DOMAIN,
			entity: WOW_PROFILE_ACCOUNT_COORDINATOR_ENTITY,
			scopeKey,
			mode: 'manual',
			triggeredBy: job.data.triggeredBy,
			jobName: job.name,
			jobId: String(job.id ?? ''),
			scheduledFor: job.timestamp ? new Date(job.timestamp) : undefined,
		})

		const queue = createQueue()

		try {
			const accounts = await listWowLinkedBattlenetAccounts(job.data.userId)
			let enqueuedCount = 0

			for (const linkedAccount of accounts) {
				await enqueueJob(queue, {
					name: 'sync:wow:profile:account',
					payload: {
						authAccountId: linkedAccount.id,
						triggeredBy: job.data.triggeredBy,
						force: job.data.force,
					},
					jobId: formatWowProfileAccountJobId(linkedAccount.id),
				})

				enqueuedCount += 1
			}

			await completeSyncRunSuccess({
				runId,
				provider: SYNC_PROVIDER,
				domain: WOW_PROFILE_SYNC_DOMAIN,
				entity: WOW_PROFILE_ACCOUNT_COORDINATOR_ENTITY,
				scopeKey,
				insertedCount: enqueuedCount,
				metadata: {
					userId: job.data.userId ?? null,
					enqueuedCount,
					jobEntity: WOW_PROFILE_ACCOUNT_ENTITY,
				},
			})

			return {
				ok: true,
				enqueuedCount,
			}
		} catch (error) {
			await completeSyncRunFailure({
				runId,
				provider: SYNC_PROVIDER,
				domain: WOW_PROFILE_SYNC_DOMAIN,
				entity: WOW_PROFILE_ACCOUNT_COORDINATOR_ENTITY,
				scopeKey,
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
