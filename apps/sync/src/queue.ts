import { JobScheduler, Queue } from 'bullmq'

import { env } from './env'
import { JOB_NAMES } from './jobs/contracts'
import type { JobName, JobPayloads } from './jobs/contracts'
import { JOB_PRIORITIES } from './types'
import type { JobPriority } from './types'

export { JOB_NAMES, type JobName, type JobPayloads } from './jobs/contracts'
export { JOB_PRIORITIES, type JobPriority } from './types'

export const queueName = 'battlenet-sync'

export const connection = {
	url: env.REDIS_URL,
}

export const createQueue = () =>
	new Queue<JobPayloads[JobName], unknown, JobName>(queueName, {
		connection,
	})

export const createJobScheduler = () =>
	new JobScheduler(queueName, {
		connection,
	})

export const addJob = async (
	queue: Queue<JobPayloads[JobName], unknown, JobName>,
	name: JobName,
	data: JobPayloads[JobName],
	priority: JobPriority = JOB_PRIORITIES.STANDARD,
	options?: {
		jobId?: string
		delayMs?: number
	},
) => {
	return queue.add(name, data, {
		priority,
		jobId: options?.jobId,
		delay: options?.delayMs,
		attempts: 5,
		backoff: {
			type: 'exponential',
			delay: 2_000,
		},
		removeOnComplete: 100,
		removeOnFail: 500,
	})
}

export const buildJobId = (name: keyof JobPayloads, parts: string[]) => {
	return [name, ...parts].join(':').toLowerCase()
}
