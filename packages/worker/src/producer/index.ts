import { JOB_PRIORITIES } from '../types'
import type { JobPriority } from '../types'
import {
	getJobDefinitions,
	isJobName,
	parseJobPayload,
} from '../contracts/index'
import type { JobName, JobPayloads } from '../contracts/index'
import { createQueue } from '../queue'
import type { WorkerQueue } from '../queue'

const LISTABLE_JOB_STATUSES = [
	'waiting',
	'waiting-children',
	'active',
	'delayed',
	'failed',
	'completed',
] as const

export const PENDING_JOB_STATUSES = [
	'waiting',
	'waiting-children',
	'active',
	'delayed',
] as const

type ListableJobStatus = (typeof LISTABLE_JOB_STATUSES)[number]
type PendingJobStatus = (typeof PENDING_JOB_STATUSES)[number]

export interface EnqueueJobInput<TName extends JobName> {
	name: TName
	payload: JobPayloads[TName]
	priority?: JobPriority
	delayMs?: number
	jobId?: string
}

export interface EnqueueUnknownJobInput {
	name: JobName
	payload: unknown
	priority?: JobPriority
	delayMs?: number
	jobId?: string
}

export interface ListJobsInput {
	status: ListableJobStatus
	limit?: number
	offset?: number
	jobName?: JobName
}

export interface ListJobsResultItem {
	id: string
	name: string
	status: ListableJobStatus
	attemptsMade: number
	timestamp: number
	processedOn?: number
	finishedOn?: number
	priority?: number
	failedReason?: string
	data: unknown
}

export interface ListJobsResult {
	items: ListJobsResultItem[]
	hasMore: boolean
}

export interface JobDependencyCounts {
	processed: number
	unprocessed: number
	failed: number
	ignored: number
}

export interface JobDependencyItem {
	id: string
	name: string
	state: string
	attemptsMade: number
	timestamp: number
	processedOn?: number
	finishedOn?: number
	failedReason?: string
	data: unknown
}

export interface JobDependencyDetails {
	counts: JobDependencyCounts
	waitingOn: JobDependencyItem[]
}

export interface EnqueueUniqueJobResult {
	job: Awaited<ReturnType<WorkerQueue['add']>>
	deduplicated: boolean
	replaced: boolean
	previousState: string | null
}

const LIST_JOBS_SCAN_WINDOW = 200

function toListJobItem(
	job: Awaited<ReturnType<WorkerQueue['getJobs']>>[number],
	status: ListableJobStatus,
): ListJobsResultItem {
	return {
		id: String(job.id ?? ''),
		name: isJobName(job.name) ? job.name : job.name,
		status,
		attemptsMade: job.attemptsMade,
		timestamp: job.timestamp,
		processedOn: job.processedOn,
		finishedOn: job.finishedOn,
		priority: job.opts.priority,
		failedReason: job.failedReason,
		data: job.data,
	}
}

export async function enqueueJob<TName extends JobName>(
	queue: WorkerQueue,
	input: EnqueueJobInput<TName>,
) {
	const payload = parseJobPayload(input.name, input.payload)

	return queue.add(input.name, payload, {
		priority: input.priority ?? JOB_PRIORITIES.STANDARD,
		delay: input.delayMs,
		jobId: input.jobId,
	})
}

export function isPendingJobState(state: string): state is PendingJobStatus {
	return PENDING_JOB_STATUSES.includes(state as PendingJobStatus)
}

export async function getJobStateById(queue: WorkerQueue, jobId: string) {
	const job = await queue.getJob(jobId)

	if (!job) {
		return null
	}

	return job.getState()
}

export async function enqueueUniqueJob<TName extends JobName>(
	queue: WorkerQueue,
	input: EnqueueJobInput<TName>,
): Promise<EnqueueUniqueJobResult> {
	if (!input.jobId) {
		return {
			job: await enqueueJob(queue, input),
			deduplicated: false,
			replaced: false,
			previousState: null,
		}
	}

	const existingJob = await queue.getJob(input.jobId)

	if (!existingJob) {
		return {
			job: await enqueueJob(queue, input),
			deduplicated: false,
			replaced: false,
			previousState: null,
		}
	}

	const previousState = await existingJob.getState()

	if (isPendingJobState(previousState)) {
		return {
			job: existingJob,
			deduplicated: true,
			replaced: false,
			previousState,
		}
	}

	await existingJob.remove()

	return {
		job: await enqueueJob(queue, input),
		deduplicated: false,
		replaced: true,
		previousState,
	}
}

export async function enqueueJobFromInput(
	queue: WorkerQueue,
	input: EnqueueUnknownJobInput,
) {
	const payload = parseJobPayload(input.name, input.payload)

	return queue.add(input.name, payload, {
		priority: input.priority ?? JOB_PRIORITIES.STANDARD,
		delay: input.delayMs,
		jobId: input.jobId,
	})
}

export async function listJobs(queue: WorkerQueue, input: ListJobsInput) {
	const limit = input.limit ?? 20
	const offset = input.offset ?? 0

	if (!input.jobName) {
		const start = offset
		const end = offset + limit - 1
		const jobs = await queue.getJobs([input.status], start, end, false)
		const hasMore =
			jobs.length === limit
				? (await queue.getJobs([input.status], end + 1, end + 1, false))
						.length > 0
				: false

		return {
			items: jobs.map((job) => toListJobItem(job, input.status)),
			hasMore,
		}
	}

	const items: ListJobsResultItem[] = []
	let skippedMatches = 0
	let cursor = 0
	let hasMore = false

	while (items.length < limit && !hasMore) {
		const batch = await queue.getJobs(
			[input.status],
			cursor,
			cursor + LIST_JOBS_SCAN_WINDOW - 1,
			false,
		)

		if (batch.length === 0) {
			break
		}

		for (const job of batch) {
			if (job.name !== input.jobName) {
				continue
			}

			if (skippedMatches < offset) {
				skippedMatches += 1
				continue
			}

			if (items.length < limit) {
				items.push(toListJobItem(job, input.status))
				continue
			}

			hasMore = true
			break
		}

		cursor += batch.length

		if (batch.length < LIST_JOBS_SCAN_WINDOW) {
			break
		}
	}

	if (!hasMore && items.length === limit) {
		while (!hasMore) {
			const batch = await queue.getJobs(
				[input.status],
				cursor,
				cursor + LIST_JOBS_SCAN_WINDOW - 1,
				false,
			)

			if (batch.length === 0) {
				break
			}

			hasMore = batch.some((job) => job.name === input.jobName)
			cursor += batch.length

			if (batch.length < LIST_JOBS_SCAN_WINDOW) {
				break
			}
		}
	}

	return { items, hasMore }
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

function parseDependencyJobId(dependencyKey: string): string {
	const separatorIndex = dependencyKey.lastIndexOf(':')

	if (separatorIndex < 0) {
		return dependencyKey
	}

	return dependencyKey.slice(separatorIndex + 1)
}

function toDependencyCount(value: number | undefined): number {
	return typeof value === 'number' ? value : 0
}

export async function getJobDependencyDetails(
	queue: WorkerQueue,
	jobId: string,
): Promise<JobDependencyDetails | null> {
	const job = await queue.getJob(jobId)

	if (!job) {
		return null
	}

	const dependencyCounts = await job.getDependenciesCount({
		processed: true,
		unprocessed: true,
		failed: true,
		ignored: true,
	})

	const counts: JobDependencyCounts = {
		processed: toDependencyCount(dependencyCounts.processed),
		unprocessed: toDependencyCount(dependencyCounts.unprocessed),
		failed: toDependencyCount(dependencyCounts.failed),
		ignored: toDependencyCount(dependencyCounts.ignored),
	}

	const dependencies = await job.getDependencies({
		unprocessed: { count: counts.unprocessed || 1000 },
		failed: { count: counts.failed || 1000 },
	})

	const dependencyKeys = new Set<string>([
		...(dependencies.unprocessed ?? []),
		...(dependencies.failed ?? []),
	])

	const waitingOn = (
		await Promise.all(
			[...dependencyKeys].map(async (dependencyKey) => {
				const dependencyJobId = parseDependencyJobId(dependencyKey)
				const dependencyJob = await queue.getJob(dependencyJobId)

				if (!dependencyJob) {
					return null
				}

				return {
					id: String(dependencyJob.id ?? ''),
					name: dependencyJob.name,
					state: await dependencyJob.getState(),
					attemptsMade: dependencyJob.attemptsMade,
					timestamp: dependencyJob.timestamp,
					processedOn: dependencyJob.processedOn,
					finishedOn: dependencyJob.finishedOn,
					failedReason: dependencyJob.failedReason,
					data: dependencyJob.data,
				} satisfies JobDependencyItem
			}),
		)
	).filter((item) => item !== null)

	waitingOn.sort((left, right) => right.timestamp - left.timestamp)

	return {
		counts,
		waitingOn,
	}
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
	type PendingJobStatus,
}
