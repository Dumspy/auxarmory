import { createQueue } from '../../queue'
import { enqueueUniqueJob } from '../../producer/index'
import { defineJob } from '../../registry'

import {
	completeSyncRunFailure,
	completeSyncRunSuccess,
	SYNC_PROVIDER,
	toErrorPayload,
	startSyncRun,
} from './utils'
import {
	WOW_PROFILE_ACCOUNT_COORDINATOR_SCHEDULE_EVERY_MS,
	WOW_PROFILE_ACCOUNT_COORDINATOR_SCHEDULE_ID,
	WOW_PROFILE_ACCOUNT_COORDINATOR_ENTITY,
	WOW_PROFILE_ACCOUNT_ENTITY,
	WOW_PROFILE_SYNC_DOMAIN,
	formatWowProfileAccountJobId,
	wowProfileAccountCoordinatorJobPayloadSchema,
} from './profile_utils'
import { listWowLinkedBattlenetAccounts } from './profile_accounts'
import type { WowProfileAccountCoordinatorJobPayload } from './profile_utils'

export const syncWowProfileAccountCoordinatorJob = defineJob({
	name: 'sync:wow:profile:account:coordinator',
	description:
		'Discover linked Battle.net accounts and enqueue roster sync jobs',
	allowManualRun: true,
	schema: wowProfileAccountCoordinatorJobPayloadSchema,
	schedule: {
		id: WOW_PROFILE_ACCOUNT_COORDINATOR_SCHEDULE_ID,
		everyMs: WOW_PROFILE_ACCOUNT_COORDINATOR_SCHEDULE_EVERY_MS,
	},
	data: {
		triggeredBy: 'scheduler',
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
			const accounts = await listWowLinkedBattlenetAccounts(
				job.data.userId,
			)
			let enqueuedCount = 0

			for (const linkedAccount of accounts) {
				const accountId = linkedAccount.id
				const accountJobId = formatWowProfileAccountJobId(accountId)

				await enqueueUniqueJob(queue, {
					name: 'sync:wow:profile:account',
					payload: {
						authAccountId: accountId,
						triggeredBy: job.data.triggeredBy,
						force: job.data.force,
					},
					jobId: accountJobId,
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
