import { Queue, Worker, QueueOptions, WorkerOptions, JobsOptions } from "bullmq";
import { createRedisConnection } from "./redis.js";
import { JobTypes, JobType, JobPayloads, JobPayloadSchemas } from "./types.js";
import {
	processCharacterDataSync,
} from "./processors/index.js";

export class QueueManager {
	private redis = createRedisConnection();
	private queues: Map<JobType, Queue> = new Map();
	private workers: Map<JobType, Worker> = new Map();

	constructor() {
		this.setupQueues();
		this.setupWorkers();
	}

	private setupQueues() {
		const queueOptions: QueueOptions = {
			connection: this.redis,
			defaultJobOptions: {
				removeOnComplete: 100,
				removeOnFail: 50,
				attempts: 3,
				backoff: {
					type: "exponential",
					delay: 2000,
				},
			},
		};

		// Create queues for each job type
		Object.values(JobTypes).forEach((jobType) => {
			const queue = new Queue(jobType, queueOptions);
			this.queues.set(jobType, queue);
		});

		console.log(`Created ${this.queues.size} queues`);
	}

	private setupWorkers() {
		const workerOptions: WorkerOptions = {
			connection: this.redis,
			concurrency: 5,
		};

		// Character data sync worker
		const characterWorker = new Worker(
			JobTypes.SYNC_CHARACTER_DATA,
			processCharacterDataSync,
			workerOptions
		);
		this.workers.set(JobTypes.SYNC_CHARACTER_DATA, characterWorker);

		// Add event listeners for all workers
		this.workers.forEach((worker, jobType) => {
			worker.on("completed", (job) => {
				console.log(`✅ Job ${job.id} (${jobType}) completed successfully`);
			});

			worker.on("failed", (job, err) => {
				console.error(`❌ Job ${job?.id} (${jobType}) failed:`, err.message);
			});

			worker.on("progress", (job, progress) => {
				console.log(`⏳ Job ${job.id} (${jobType}) progress: ${progress}%`);
			});
		});

		console.log(`Created ${this.workers.size} workers`);
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

		console.log(`📝 Added job ${job.id} (${jobType}) to queue`);
		return job;
	}

	// Method to get queue statistics
	async getQueueStats(jobType: JobType) {
		const queue = this.queues.get(jobType);
		if (!queue) {
			throw new Error(`Queue for job type ${jobType} not found`);
		}

		const [waiting, active, completed, failed] = await Promise.all([
			queue.getWaiting(),
			queue.getActive(),
			queue.getCompleted(),
			queue.getFailed(),
		]);

		return {
			waiting: waiting.length,
			active: active.length,
			completed: completed.length,
			failed: failed.length,
		};
	}

	// Method to get all queue statistics
	async getAllQueueStats() {
		const stats: Record<string, any> = {};
		
		for (const [jobType, queue] of this.queues) {
			stats[jobType] = await this.getQueueStats(jobType);
		}

		return stats;
	}

	// Graceful shutdown
	async shutdown() {
		console.log("🔄 Shutting down queue manager...");

		// Close all workers
		const workerClosures = Array.from(this.workers.values()).map(worker => worker.close());
		await Promise.all(workerClosures);

		// Close all queues
		const queueClosures = Array.from(this.queues.values()).map(queue => queue.close());
		await Promise.all(queueClosures);

		// Close Redis connection
		await this.redis.quit();

		console.log("✅ Queue manager shut down successfully");
	}
}
