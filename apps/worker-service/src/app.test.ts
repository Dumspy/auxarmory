import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
	startWorkerService: vi.fn(),
}))

vi.mock('@auxarmory/worker', () => ({
	startWorkerService: mocks.startWorkerService,
}))

import { createWorkerService } from './app.js'

describe('createWorkerService', () => {
	beforeEach(() => {
		mocks.startWorkerService.mockReset()
	})

	it('delegates to startWorkerService', async () => {
		const service = {
			stop: vi.fn().mockResolvedValue(undefined),
		}
		mocks.startWorkerService.mockResolvedValue(service)

		await expect(createWorkerService()).resolves.toBe(service)
		expect(mocks.startWorkerService).toHaveBeenCalledTimes(1)
	})
})
