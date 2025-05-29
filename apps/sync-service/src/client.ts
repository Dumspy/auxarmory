import { JobsOptions, Queue } from "bullmq";
import { JobTypes, JobPayloads, JobType } from "./types.js";
import { env } from "./env.js";

export class SyncServiceClient {
	private queues: Map<JobType, Queue> = new Map();

	constructor() {
		Object.values(JobTypes).forEach((jobType) => {
			const queue = new Queue(jobType, {
				connection: {
					url: env.REDIS_URL,
				},
			});
			this.queues.set(jobType, queue);
		});
	}

	async addJob<T extends keyof JobPayloads>(
		jobType: T,
		data: JobPayloads[T],
		options?: JobsOptions
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
		const closures = Array.from(this.queues.values()).map(queue => queue.close());
		await Promise.all(closures);
	}
}

export { JobTypes, type JobPayloads } from "./types.js";
