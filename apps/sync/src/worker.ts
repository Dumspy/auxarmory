import * as Sentry from '@sentry/node'
import type { Job } from 'bullmq'
import { Worker as BullWorker } from 'bullmq'

import {
	createSyncJobFailureCaptureContext,
	redactPayloadValues,
} from '@auxarmory/observability'

import { connection, queueName } from './queue'
import { handleJob } from './jobs/index'
import type { JobName, JobPayloads } from './jobs/index'

const processor = async (job: Job<JobPayloads[JobName], unknown, JobName>) => {
	const preview = redactPayloadValues(job.data)
	const priority = job.opts.priority ?? 'standard'
	console.log(
		`[sync] job received: ${job.name} (priority: ${priority})`,
		preview,
	)

	return handleJob(job)
}

export const startWorker = () => {
	const worker = new BullWorker<JobPayloads[JobName], unknown, JobName>(
		queueName,
		processor,
		{
			connection,
			concurrency: 2,
		},
	)

	worker.on(
		'failed',
		(
			job: Job<JobPayloads[JobName], unknown, JobName> | undefined,
			error: Error,
		) => {
			if (job) {
				Sentry.captureException(
					error,
					createSyncJobFailureCaptureContext(job, error),
				)

				console.error(`[sync] job failed: ${job.name}`, {
					jobId: job.id,
					attempts: job.attemptsMade,
					error: error.message,
				})
			}
		},
	)

	return worker
}

export const registerWorkerShutdown = (
	worker: BullWorker<JobPayloads[JobName], unknown, JobName>,
) => {
	const shutdown = async (signal: string) => {
		console.log(`[sync] ${signal} received, shutting down worker`)
		await worker.close()
		process.exit(0)
	}

	process.on('SIGINT', () => shutdown('SIGINT'))
	process.on('SIGTERM', () => shutdown('SIGTERM'))
}
