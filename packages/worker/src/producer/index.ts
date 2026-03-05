import { JOB_PRIORITIES } from '../types.js'
import type { JobPriority } from '../types.js'
import {
	getJobDefinitions,
	isJobName,
	parseJobPayload,
} from '../contracts/index.js'
import type { JobName, JobPayloads } from '../contracts/index.js'
import { createQueue } from '../queue.js'
import type { WorkerQueue } from '../queue.js'

const LISTABLE_JOB_STATUSES = [
	'waiting',
	'active',
	'delayed',
	'failed',
	'completed',
] as const

type ListableJobStatus = (typeof LISTABLE_JOB_STATUSES)[number]

export interface EnqueueJobInput<TName extends JobName> {
	name: TName
	payload: JobPayloads[TName]
	priority?: JobPriority
	delayMs?: number
}

export interface EnqueueUnknownJobInput {
	name: JobName
	payload: unknown
	priority?: JobPriority
	delayMs?: number
}

export interface ListJobsInput {
	status: ListableJobStatus
	limit?: number
	offset?: number
	jobName?: JobName
}

export async function enqueueJob<TName extends JobName>(
	queue: WorkerQueue,
	input: EnqueueJobInput<TName>,
) {
	const payload = parseJobPayload(input.name, input.payload)

	return queue.add(input.name, payload, {
		priority: input.priority ?? JOB_PRIORITIES.STANDARD,
		delay: input.delayMs,
	})
}

export async function enqueueJobFromInput(
	queue: WorkerQueue,
	input: EnqueueUnknownJobInput,
) {
	const payload = parseJobPayload(input.name, input.payload)

	return queue.add(input.name, payload, {
		priority: input.priority ?? JOB_PRIORITIES.STANDARD,
		delay: input.delayMs,
	})
}

export async function listJobs(queue: WorkerQueue, input: ListJobsInput) {
	const limit = input.limit ?? 20
	const offset = input.offset ?? 0
	const start = offset
	const end = offset + limit - 1

	const jobs = await queue.getJobs([input.status], start, end, false)
	const filteredJobs = input.jobName
		? jobs.filter((job) => job.name === input.jobName)
		: jobs

	return filteredJobs.map((job) => ({
		id: String(job.id ?? ''),
		name: isJobName(job.name) ? job.name : job.name,
		status: input.status,
		attemptsMade: job.attemptsMade,
		timestamp: job.timestamp,
		processedOn: job.processedOn,
		finishedOn: job.finishedOn,
		priority: job.opts.priority,
		failedReason: job.failedReason,
		data: job.data,
	}))
}

export async function getQueueOverview(queue: WorkerQueue) {
	const counts = await queue.getJobCounts(...LISTABLE_JOB_STATUSES)
	const schedulers = await queue.getJobSchedulers(0, 100, true)

	return {
		counts,
		schedulers: schedulers.map((scheduler) => ({
			id: scheduler.id,
			name: scheduler.name,
			next: scheduler.next,
			every: scheduler.every,
			pattern: scheduler.pattern,
		})),
	}
}

export async function retryJobById(queue: WorkerQueue, jobId: string) {
	const job = await queue.getJob(jobId)

	if (!job) {
		return false
	}

	await job.retry()
	return true
}

export function getManualJobDefinitions() {
	return getJobDefinitions().filter((definition) => definition.allowManualRun)
}

export {
	createQueue,
	isJobName,
	parseJobPayload,
	LISTABLE_JOB_STATUSES,
	type JobName,
	type JobPayloads,
	type ListableJobStatus,
}
