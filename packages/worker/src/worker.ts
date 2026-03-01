import type { Job } from 'bullmq'
import { Worker as BullWorker } from 'bullmq'

import type { JobName, JobPayloads } from './jobs/index.js'
import { handleJob } from './jobs/index.js'
import { connection, queueName } from './queue.js'

type WorkerJob = Job<JobPayloads[JobName], unknown, JobName>

function redactPayload(payload: unknown): unknown {
	if (payload == null) {
		return payload
	}

	if (Array.isArray(payload)) {
		return payload.map(() => '[redacted]')
	}

	if (typeof payload === 'object') {
		const redacted: Record<string, string> = {}

		for (const key of Object.keys(payload)) {
			redacted[key] = '[redacted]'
		}

		return redacted
	}

	return '[redacted]'
}

async function processor(job: WorkerJob): Promise<unknown> {
	const preview = redactPayload(job.data)
	const priority = job.opts.priority ?? 'standard'
	console.log(
		`[worker] job received: ${job.name} (priority: ${priority})`,
		preview,
	)

	return handleJob(job)
}

export function startWorker(): BullWorker<
	JobPayloads[JobName],
	unknown,
	JobName
> {
	return new BullWorker<JobPayloads[JobName], unknown, JobName>(
		queueName,
		processor,
		{
			connection,
			concurrency: 2,
		},
	)
}
