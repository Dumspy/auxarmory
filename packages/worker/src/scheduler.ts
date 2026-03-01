import type { JobScheduler } from 'bullmq'

import { JOB_PRIORITIES } from './types.js'
import { createJobScheduler } from './queue.js'
import { syncRepeatableExample } from './jobs/example.js'

type RepeatOptions = Parameters<JobScheduler['upsertJobScheduler']>[1]
type UpsertOptions = Parameters<JobScheduler['upsertJobScheduler']>[4]

interface RepeatableJobConfig {
	id: string
	name: typeof syncRepeatableExample.name
	repeat: RepeatOptions
	data: typeof syncRepeatableExample.data
	options?: UpsertOptions
}

const repeatableJobs: RepeatableJobConfig[] = [
	{
		id: 'sync-example-repeatable',
		name: syncRepeatableExample.name,
		repeat: {
			every: 15 * 60 * 1000,
		},
		data: syncRepeatableExample.data,
		options: {
			priority: JOB_PRIORITIES.STANDARD,
		},
	},
]

export function startScheduler(): JobScheduler {
	return createJobScheduler()
}

export async function registerRepeatables(
	scheduler: JobScheduler,
): Promise<void> {
	for (const job of repeatableJobs) {
		await scheduler.upsertJobScheduler(
			job.id,
			job.repeat,
			job.name,
			job.data,
			job.options ?? {},
			{ override: true },
		)
	}
}
