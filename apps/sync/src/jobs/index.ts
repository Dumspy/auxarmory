import type { Job } from 'bullmq'

import syncExample, { SYNC_EXAMPLE_NAME } from './example'

export const JOB_NAMES = {
	SYNC_EXAMPLE: SYNC_EXAMPLE_NAME,
} as const

export const jobRegistry = {
	[JOB_NAMES.SYNC_EXAMPLE]: syncExample,
} as const

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES]
export interface JobPayloads {
	[JOB_NAMES.SYNC_EXAMPLE]: typeof syncExample.data
}

type JobHandler = (
	job: Job<JobPayloads[JobName], unknown, JobName>,
) => Promise<unknown>

const resolveHandler = (name: JobName): JobHandler | undefined => {
	const entry = jobRegistry[name as keyof typeof jobRegistry] as unknown as {
		handler?: JobHandler
	}
	return entry?.handler
}

export const handleJob = async (
	job: Job<JobPayloads[JobName], unknown, JobName>,
) => {
	const handler = resolveHandler(job.name)

	if (!handler) {
		throw new Error(`No handler registered for job: ${job.name}`)
	}

	return handler(job)
}
