import type { JobScheduler } from 'bullmq'

import { env } from './env'
import { JOB_NAMES } from './jobs/contracts'
import { createQueue } from './queue'
import { createJobScheduler } from './queue'

export const startScheduler = () => createJobScheduler()

export const registerRepeatables = async (_scheduler: JobScheduler) => {
	const queue = createQueue()

	await queue.add(
		JOB_NAMES.SYNC_SCAN_LINKED_ACCOUNTS,
		{ reason: 'repeatable' },
		{
			jobId: 'sync_scan_linked_accounts',
			repeat: {
				every: env.SYNC_SCAN_LINKED_ACCOUNTS_EVERY_MS,
			},
			removeOnComplete: 100,
			removeOnFail: 500,
		},
	)

	await queue.add(
		JOB_NAMES.SYNC_SCAN_GUILDS,
		{ reason: 'repeatable' },
		{
			jobId: 'sync_scan_guilds',
			repeat: {
				every: env.SYNC_SCAN_GUILDS_EVERY_MS,
			},
			removeOnComplete: 100,
			removeOnFail: 500,
		},
	)

	await queue.add(
		JOB_NAMES.SYNC_RECONCILE_GUILD_CONTROL,
		{ reason: 'repeatable' },
		{
			jobId: 'sync_reconcile_guild_control',
			repeat: {
				every: env.SYNC_RECONCILE_GUILD_CONTROL_EVERY_MS,
			},
			removeOnComplete: 100,
			removeOnFail: 500,
		},
	)

	await queue.close()
}
