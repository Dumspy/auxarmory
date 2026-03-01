import { beforeEach, describe, expect, it, vi } from 'vitest'

import { JOB_PRIORITIES } from './types.js'

const mocks = vi.hoisted(() => ({
	createJobScheduler: vi.fn(),
}))

vi.mock('./queue.js', () => ({
	createJobScheduler: mocks.createJobScheduler,
}))

import { registerRepeatables, startScheduler } from './scheduler.js'

describe('scheduler', () => {
	beforeEach(() => {
		mocks.createJobScheduler.mockReset()
	})

	it('delegates startScheduler to createJobScheduler', () => {
		const scheduler = { close: vi.fn() }
		mocks.createJobScheduler.mockReturnValue(scheduler)

		expect(startScheduler()).toBe(scheduler)
		expect(mocks.createJobScheduler).toHaveBeenCalledTimes(1)
	})

	it('registers the expected repeatable job', async () => {
		const upsertJobScheduler = vi.fn().mockResolvedValue(undefined)

		await registerRepeatables({ upsertJobScheduler } as never)

		expect(upsertJobScheduler).toHaveBeenCalledTimes(1)
		expect(upsertJobScheduler).toHaveBeenCalledWith(
			'sync-example-repeatable',
			{ every: 15 * 60 * 1000 },
			'sync:example:repeatable',
			{ profileId: 'repeatable-example', region: 'us' },
			{ priority: JOB_PRIORITIES.STANDARD },
			{ override: true },
		)
	})
})
