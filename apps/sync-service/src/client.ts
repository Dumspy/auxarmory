import type { JobsOptions } from "bullmq";
import { Queue } from "bullmq";

import type { JobPayloads, JobType } from "./types";
import { createQueueOptions } from "./defaults";
import { createRedisConnection } from "./redis";
import { JobTypes } from "./types";

export class SyncServiceClient {
	private redis = createRedisConnection();
	private queues = new Map<JobType, Queue>();

	constructor() {
		const options = createQueueOptions(this.redis);

		Object.values(JobTypes).forEach((jobType) => {
			const queue = new Queue(jobType, options);
			this.queues.set(jobType, queue);
		});
	}

	async addJob<T extends keyof JobPayloads>(
		jobType: T,
		data: JobPayloads[T],
		options?: JobsOptions,
	) {
		const queue = this.queues.get(jobType);
		if (!queue) {
			throw new Error(`Queue for job type ${jobType} not found`);
		}

		const job = await queue.add(jobType, data, options);

		return {
			jobId: job.id,
			jobType,
			data: data,
		};
	}

	async close() {
		const closures = Array.from(this.queues.values()).map((queue) =>
			queue.close(),
		);
		await Promise.all(closures);
	}
}

export { JobTypes, type JobPayloads } from "./types";
