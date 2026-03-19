import { beforeEach, describe, expect, it, vi } from 'vitest'

import { JOB_PRIORITIES } from './types'

const mocks = vi.hoisted(() => ({
	createJobScheduler: vi.fn(),
}))

vi.mock('./queue', () => ({
	createJobScheduler: mocks.createJobScheduler,
}))

import { registerRepeatables, startScheduler } from './scheduler'

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

	it('registers expected repeatable jobs', async () => {
		const upsertJobScheduler = vi.fn().mockResolvedValue(undefined)

		await registerRepeatables({ upsertJobScheduler } as never)

		expect(upsertJobScheduler).toHaveBeenCalledTimes(3)
		expect(upsertJobScheduler).toHaveBeenCalledWith(
			'sync-example-repeatable',
			{ every: 15 * 60 * 1000, pattern: undefined },
			'sync:example:repeatable',
			{ profileId: 'repeatable-example', region: 'us' },
			{ priority: JOB_PRIORITIES.STANDARD },
			{ override: true },
		)
		expect(upsertJobScheduler).toHaveBeenCalledWith(
			'sync-wow-static-weekly-coordinator',
			{ every: 30 * 60 * 1000, pattern: undefined },
			'sync:wow:static:weekly:coordinator',
			{ triggeredBy: 'scheduler', force: false },
			{ priority: JOB_PRIORITIES.STANDARD },
			{ override: true },
		)
		expect(upsertJobScheduler).toHaveBeenCalledWith(
			'sync-wow-profile-account-coordinator',
			{ every: 4 * 60 * 60 * 1000, pattern: undefined },
			'sync:wow:profile:account:coordinator',
			{ triggeredBy: 'scheduler', force: false },
			{ priority: JOB_PRIORITIES.STANDARD },
			{ override: true },
		)
	})
})
