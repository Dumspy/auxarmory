import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getJobNames, handleJob, isJobName } from './index.js'

describe('job registry', () => {
	beforeEach(() => {
		vi.spyOn(console, 'log').mockImplementation(() => undefined)
	})

	it('reports known job names', () => {
		expect(getJobNames()).toEqual([
			'sync:example',
			'sync:example:repeatable',
		])
		expect(isJobName('sync:example')).toBe(true)
		expect(isJobName('sync:example:repeatable')).toBe(true)
		expect(isJobName('unknown:job')).toBe(false)
	})

	it('dispatches a known job to its handler', async () => {
		const result = await handleJob({
			name: 'sync:example',
			data: {
				profileId: 'profile-1',
				region: 'us',
			},
		} as never)

		expect(result).toEqual({ ok: true })
	})

	it('throws for unknown jobs', async () => {
		await expect(
			handleJob({
				name: 'sync:unknown',
				data: {},
			} as never),
		).rejects.toThrow('No handler registered for job: sync:unknown')
	})
})
