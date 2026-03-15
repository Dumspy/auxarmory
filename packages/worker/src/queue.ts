import { FlowProducer, JobScheduler, Queue } from 'bullmq'

import type { JobName, JobPayloads } from './contracts'
import { env } from './env'
import { JOB_PRIORITIES } from './types'
import type { JobPriority } from './types'

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

export function createFlowProducer(): FlowProducer {
	return new FlowProducer({
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
