import type { JobScheduler } from 'bullmq'

import { JOB_PRIORITIES } from './types.js'
import { getRecurringJobDefinitions } from './contracts.js'
import { createJobScheduler } from './queue.js'

type RepeatOptions = Parameters<JobScheduler['upsertJobScheduler']>[1]
type UpsertOptions = Parameters<JobScheduler['upsertJobScheduler']>[4]

interface RepeatableJobConfig {
	id: string
	name: string
	repeat: RepeatOptions
	data: unknown
	options?: UpsertOptions
}

const repeatableJobs: RepeatableJobConfig[] = getRecurringJobDefinitions().map(
	(definition) => ({
		id: definition.schedule.id,
		name: definition.name,
		repeat: {
			every: definition.schedule.everyMs,
			pattern: definition.schedule.pattern,
		},
		data: definition.payload,
		options: {
			priority: definition.schedule.priority ?? JOB_PRIORITIES.STANDARD,
		},
	}),
)

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
