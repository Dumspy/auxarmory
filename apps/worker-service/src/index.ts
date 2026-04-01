import { createWorkerService } from './app'

let service: Awaited<ReturnType<typeof createWorkerService>> | undefined
let terminating = false

async function terminateWithError(
	label: string,
	error: unknown,
): Promise<void> {
	if (terminating) {
		return
	}

	terminating = true
	console.error(`[worker-service] ${label}`, error)

	if (service) {
		await service.stop().catch((stopError: unknown) => {
			console.error('[worker-service] failed to stop service', stopError)
		})
	}

	process.exit(1)
}

process.on('unhandledRejection', (reason) => {
	void terminateWithError('unhandled rejection', reason)
})

process.on('uncaughtException', (error) => {
	void terminateWithError('uncaught exception', error)
})

try {
	service = await createWorkerService()
} catch (error) {
	await terminateWithError('startup failed', error)
}
