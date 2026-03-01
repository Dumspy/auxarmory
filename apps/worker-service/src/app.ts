import { startWorkerService } from '@auxarmory/worker'
import type { WorkerService } from '@auxarmory/worker'

export function createWorkerService(): Promise<WorkerService> {
	return startWorkerService()
}
