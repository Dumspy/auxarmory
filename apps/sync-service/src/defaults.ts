import type { ConnectionOptions, QueueOptions, WorkerOptions } from "bullmq";

const queueOptions: Omit<QueueOptions, "connection"> = {
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

export function createQueueOptions(redis: ConnectionOptions): QueueOptions {
	return {
		connection: redis,
		...queueOptions,
	};
}

const workerOptions: Omit<WorkerOptions, "connection"> = {
	concurrency: 5,
};

export function createWorkerOptions(redis: ConnectionOptions): WorkerOptions {
	return {
		connection: redis,
		...workerOptions,
	};
}
