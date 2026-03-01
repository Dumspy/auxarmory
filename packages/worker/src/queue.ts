import { JobScheduler, Queue } from 'bullmq'

import type { JobName, JobPayloads } from './contracts.js'
import { env } from './env.js'
import { JOB_PRIORITIES } from './types.js'
import type { JobPriority } from './types.js'

export const queueName = 'battlenet-sync'

export const connection = {
	url: env.REDIS_URL,
}

export type WorkerQueue = Queue<JobPayloads[JobName], unknown, JobName>

export function createQueue(): WorkerQueue {
	return new Queue<JobPayloads[JobName], unknown, JobName>(queueName, {
		connection,
	})
}

export function createJobScheduler(): JobScheduler {
	return new JobScheduler(queueName, {
		connection,
	})
}

export async function addJob<TName extends JobName>(
	queue: WorkerQueue,
	name: TName,
	data: JobPayloads[TName],
	priority: JobPriority = JOB_PRIORITIES.STANDARD,
) {
	return queue.add(name, data, {
		priority,
	})
}
