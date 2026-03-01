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
	let stopping: Promise<void> | undefined

	async function stop(): Promise<void> {
		if (stopped) {
			return
		}

		if (stopping) {
			return stopping
		}

		stopping = (async () => {
			const errors: unknown[] = []

			try {
				await worker.close()
			} catch (error) {
				errors.push(error)
			}

			try {
				await scheduler.close()
			} catch (error) {
				errors.push(error)
			}

			try {
				await queue.close()
			} catch (error) {
				errors.push(error)
			}

			if (errors.length > 0) {
				throw new AggregateError(
					errors,
					'Failed to stop worker service',
				)
			}

			stopped = true
		})()

		try {
			await stopping
		} finally {
			if (!stopped) {
				stopping = undefined
			}
		}
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
