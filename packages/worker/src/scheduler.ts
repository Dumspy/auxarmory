import type { JobScheduler } from 'bullmq'

import { createJobScheduler } from './queue.js'

export function startScheduler(): JobScheduler {
	return createJobScheduler()
}

export function registerRepeatables(_scheduler: JobScheduler): Promise<void> {
	return Promise.resolve()
}
