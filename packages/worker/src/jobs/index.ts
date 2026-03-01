import type { Job } from 'bullmq'

import { syncExample, syncRepeatableExample } from './example.js'

export const jobRegistry = {
	[syncExample.name]: syncExample,
	[syncRepeatableExample.name]: syncRepeatableExample,
} as const

export type JobName = keyof typeof jobRegistry

export type JobPayloads = {
	[TName in JobName]: (typeof jobRegistry)[TName]['data']
}

type JobHandler = (
	job: Job<JobPayloads[JobName], unknown, JobName>,
) => Promise<unknown>

export function getJobNames(): JobName[] {
	return Object.keys(jobRegistry) as JobName[]
}

export function isJobName(value: string): value is JobName {
	return value in jobRegistry
}

function resolveHandler(name: JobName): JobHandler | undefined {
	const entry = jobRegistry[name]
	return entry.handler as JobHandler | undefined
}

export async function handleJob(
	job: Job<JobPayloads[JobName], unknown, JobName>,
): Promise<unknown> {
	const handler = resolveHandler(job.name)

	if (!handler) {
		throw new Error(`No handler registered for job: ${job.name}`)
	}

	return handler(job)
}
