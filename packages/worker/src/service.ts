import './env.js'

import { createQueue } from './queue.js'
import { registerRepeatables, startScheduler } from './scheduler.js'
import { startWorker } from './worker.js'

export interface WorkerService {
	stop: () => Promise<void>
}

export async function startWorkerService(): Promise<WorkerService> {
	const scheduler = startScheduler()
	await registerRepeatables(scheduler)

	const queue = createQueue()
	const worker = startWorker()
	let stopped = false

	async function stop(): Promise<void> {
		if (stopped) {
			return
		}

		stopped = true
		await worker.close()
		await scheduler.close()
		await queue.close()
	}

	async function shutdown(signal: string): Promise<void> {
		console.log(`[worker] ${signal} received, shutting down worker service`)
		await stop()
		process.exit(0)
	}

	process.on('SIGINT', () => {
		void shutdown('SIGINT')
	})

	process.on('SIGTERM', () => {
		void shutdown('SIGTERM')
	})

	console.log('[worker] worker ready')

	return {
		stop,
	}
}
