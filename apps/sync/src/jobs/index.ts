import type { Job } from 'bullmq'

import { JOB_NAMES } from './contracts'
import type {
	JobName,
	JobPayloads,
	SyncGuildPayload,
	SyncReconcileGuildControlPayload,
	SyncScanGuildsPayload,
	SyncScanLinkedAccountsPayload,
	SyncUserAccountPayload,
} from './contracts'
import {
	syncGuild,
	syncReconcileGuildControl,
	syncScanGuilds,
	syncScanLinkedAccounts,
	syncUserAccount,
} from './sync/index'

export { JOB_NAMES }
export type {
	JobName,
	JobPayloads,
	SyncGuildPayload,
	SyncReconcileGuildControlPayload,
	SyncScanGuildsPayload,
	SyncScanLinkedAccountsPayload,
	SyncUserAccountPayload,
}

export const jobRegistry = {
	[JOB_NAMES.SYNC_USER_ACCOUNT]: syncUserAccount,
	[JOB_NAMES.SYNC_GUILD]: syncGuild,
	[JOB_NAMES.SYNC_SCAN_LINKED_ACCOUNTS]: syncScanLinkedAccounts,
	[JOB_NAMES.SYNC_SCAN_GUILDS]: syncScanGuilds,
	[JOB_NAMES.SYNC_RECONCILE_GUILD_CONTROL]: syncReconcileGuildControl,
} as const

type JobHandler = (
	job: Job<JobPayloads[JobName], unknown, JobName>,
) => Promise<unknown>

function resolveHandler(name: JobName): JobHandler | undefined {
	const entry = jobRegistry[name as keyof typeof jobRegistry]
	return entry?.handler as JobHandler | undefined
}

export const handleJob = async (
	job: Job<JobPayloads[JobName], unknown, JobName>,
): Promise<unknown> => {
	const handler = resolveHandler(job.name)

	if (!handler) {
		throw new Error(`No handler registered for job: ${job.name}`)
	}

	return handler(job)
}
