import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
	const workerClose = vi.fn()
	const schedulerClose = vi.fn()
	const queueClose = vi.fn()

	return {
		workerClose,
		schedulerClose,
		queueClose,
		startWorker: vi.fn(() => ({ close: workerClose })),
		startScheduler: vi.fn(() => ({ close: schedulerClose })),
		createQueue: vi.fn(() => ({ close: queueClose })),
		registerRepeatables: vi.fn().mockResolvedValue(undefined),
	}
})

vi.mock('./env.js', () => ({}))
vi.mock('./worker.js', () => ({
	startWorker: mocks.startWorker,
}))
vi.mock('./scheduler.js', () => ({
	startScheduler: mocks.startScheduler,
	registerRepeatables: mocks.registerRepeatables,
}))
vi.mock('./queue.js', () => ({
	createQueue: mocks.createQueue,
}))

import { startWorkerService } from './service.js'

describe('startWorkerService', () => {
	beforeEach(() => {
		mocks.workerClose.mockReset().mockResolvedValue(undefined)
		mocks.schedulerClose.mockReset().mockResolvedValue(undefined)
		mocks.queueClose.mockReset().mockResolvedValue(undefined)
		mocks.startWorker
			.mockReset()
			.mockReturnValue({ close: mocks.workerClose })
		mocks.startScheduler
			.mockReset()
			.mockReturnValue({ close: mocks.schedulerClose })
		mocks.createQueue
			.mockReset()
			.mockReturnValue({ close: mocks.queueClose })
		mocks.registerRepeatables.mockReset().mockResolvedValue(undefined)
		vi.spyOn(console, 'log').mockImplementation(() => undefined)
	})

	it('stops worker resources only once for concurrent stop calls', async () => {
		const service = await startWorkerService()

		await Promise.all([service.stop(), service.stop()])

		expect(mocks.startScheduler).toHaveBeenCalledTimes(1)
		expect(mocks.registerRepeatables).toHaveBeenCalledTimes(1)
		expect(mocks.createQueue).toHaveBeenCalledTimes(1)
		expect(mocks.startWorker).toHaveBeenCalledTimes(1)
		expect(mocks.workerClose).toHaveBeenCalledTimes(1)
		expect(mocks.schedulerClose).toHaveBeenCalledTimes(1)
		expect(mocks.queueClose).toHaveBeenCalledTimes(1)
	})

	it('allows retrying stop after a teardown failure', async () => {
		mocks.workerClose
			.mockRejectedValueOnce(new Error('close failed'))
			.mockResolvedValue(undefined)

		const service = await startWorkerService()

		await expect(service.stop()).rejects.toBeInstanceOf(AggregateError)
		await expect(service.stop()).resolves.toBeUndefined()

		expect(mocks.workerClose).toHaveBeenCalledTimes(2)
		expect(mocks.schedulerClose).toHaveBeenCalledTimes(2)
		expect(mocks.queueClose).toHaveBeenCalledTimes(2)
	})
})
