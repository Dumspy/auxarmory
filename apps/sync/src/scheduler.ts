import type { JobScheduler } from 'bullmq'

import { createJobScheduler } from './queue'

export const startScheduler = () => createJobScheduler()

export const registerRepeatables = async (_scheduler: JobScheduler) => {
	return
}
