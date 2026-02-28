import type { Job } from 'bullmq'
import { Worker as BullWorker } from 'bullmq'

import { connection, queueName } from './queue'
import { handleJob } from './jobs/index'
import type { JobName, JobPayloads } from './jobs/index'

const redactPayload = (payload: unknown) => {
	if (payload == null) {
		return payload
	}

	if (Array.isArray(payload)) {
		return payload.map(() => '[redacted]')
	}

	if (typeof payload === 'object') {
		return Object.keys(payload as Record<string, unknown>).reduce(
			(result, key) => ({
				...result,
				[key]: '[redacted]',
			}),
			{} as Record<string, string>,
		)
	}

	return '[redacted]'
}

const processor = async (job: Job<JobPayloads[JobName], unknown, JobName>) => {
	const preview = redactPayload(job.data)
	const priority = job.opts.priority ?? 'standard'
	console.log(
		`[sync] job received: ${job.name} (priority: ${priority})`,
		preview,
	)

	return handleJob(job)
}

export const startWorker = () =>
	new BullWorker<JobPayloads[JobName], unknown, JobName>(
		queueName,
		processor,
		{
			connection,
			concurrency: 2,
		},
	)

export const registerWorkerShutdown = (
	worker: BullWorker<JobPayloads[JobName], unknown, JobName>,
) => {
	worker.on('completed', (job) => {
		console.log(`[sync] job completed: ${job.name} (${job.id ?? 'no-id'})`)
	})

	worker.on('failed', (job, error) => {
		console.error(
			`[sync] job failed: ${job?.name ?? 'unknown'} (${job?.id ?? 'no-id'})`,
			error,
		)
	})

	const shutdown = async (signal: string) => {
		console.log(`[sync] ${signal} received, shutting down worker`)
		await worker.close()
		process.exit(0)
	}

	process.on('SIGINT', () => shutdown('SIGINT'))
	process.on('SIGTERM', () => shutdown('SIGTERM'))
}
