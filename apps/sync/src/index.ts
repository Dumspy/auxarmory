import './env'

import { createQueue } from './queue'
import { registerRepeatables, startScheduler } from './scheduler'
import { registerWorkerShutdown, startWorker } from './worker'

const start = async () => {
	const scheduler = startScheduler()
	await registerRepeatables(scheduler)

	const queue = createQueue()
	const worker = startWorker()

	console.log('[sync] worker ready')

	registerWorkerShutdown(worker)

	process.on('SIGINT', async () => {
		await scheduler.close()
		await queue.close()
	})

	process.on('SIGTERM', async () => {
		await scheduler.close()
		await queue.close()
	})
}

void start()
