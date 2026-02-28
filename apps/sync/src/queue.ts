import { JobScheduler, Queue } from 'bullmq';

import { env } from './env';
import { JOB_PRIORITIES } from './types';
import type { JobName, JobPayloads } from './jobs/index';
import type { JobPriority } from './types';

export { JOB_NAMES, type JobName, type JobPayloads } from './jobs/index';
export { JOB_PRIORITIES, type JobPriority } from './types';

export const queueName = 'battlenet-sync';

export const connection = {
	url: env.REDIS_URL,
};

export const createQueue = () =>
	new Queue<JobPayloads[JobName], unknown, JobName>(queueName, {
		connection,
	});

export const createJobScheduler = () =>
	new JobScheduler(queueName, {
		connection,
	});

export const addJob = async (
	queue: Queue<JobPayloads[JobName], unknown, JobName>,
	name: JobName,
	data: JobPayloads[JobName],
	priority: JobPriority = JOB_PRIORITIES.STANDARD,
) => {
	return queue.add(name, data, {
		priority,
	});
};
