import * as Sentry from '@sentry/node'
import type { Job } from 'bullmq'
import { Worker as BullWorker } from 'bullmq'

import { isBattlenetError } from '@auxarmory/battlenet/errors'
import {
	createSyncJobFailureCaptureContext,
	redactPayloadValues,
} from '@auxarmory/observability'

import type { JobName, JobPayloads } from './contracts.js'
import { handleJob } from './contracts.js'
import { connection, queueName } from './queue.js'

type WorkerJob = Job<JobPayloads[JobName], unknown, JobName>

async function processor(job: WorkerJob): Promise<unknown> {
	const preview = redactPayloadValues(job.data)
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
	const worker = new BullWorker<JobPayloads[JobName], unknown, JobName>(
		queueName,
		processor,
		{
			connection,
			concurrency: 2,
		},
	)

	worker.on('failed', (job: WorkerJob | undefined, error: Error) => {
		if (!job) {
			return
		}

		if (!isBattlenetError(error)) {
			Sentry.captureException(
				error,
				createSyncJobFailureCaptureContext(job, error),
			)
		}

		console.error(`[worker] job failed: ${job.name}`, {
			jobId: job.id,
			attempts: job.attemptsMade,
			error: error.message,
		})
	})

	return worker
}
