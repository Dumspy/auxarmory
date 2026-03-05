import { startWorkerService } from '@auxarmory/worker/runtime'
import type { WorkerService } from '@auxarmory/worker/runtime'

export function createWorkerService(): Promise<WorkerService> {
	return startWorkerService()
}
