import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getJobNames, handleJob, isJobName, parseJobPayload } from './index'

describe('job registry', () => {
	beforeEach(() => {
		vi.spyOn(console, 'log').mockImplementation(() => undefined)
	})

	it('reports known job names', () => {
		expect(getJobNames()).toEqual([
			'sync:example',
			'sync:example:repeatable',
			'sync:wow:profile:account:coordinator',
			'sync:wow:profile:account',
			'sync:wow:profile:character',
			'sync:wow:static:weekly:coordinator',
			'sync:wow:static:weekly:connected-realms',
			'sync:wow:static:weekly:realms',
			'sync:wow:static:weekly:playable-classes',
			'sync:wow:static:weekly:playable-races',
			'sync:wow:static:weekly:playable-specializations',
			'sync:wow:static:weekly:professions',
			'sync:wow:static:weekly:region',
		])
		expect(isJobName('sync:example')).toBe(true)
		expect(isJobName('sync:example:repeatable')).toBe(true)
		expect(isJobName('sync:wow:profile:account:coordinator')).toBe(true)
		expect(isJobName('sync:wow:profile:account')).toBe(true)
		expect(isJobName('sync:wow:profile:character')).toBe(true)
		expect(isJobName('sync:wow:static:weekly:coordinator')).toBe(true)
		expect(isJobName('sync:wow:static:weekly:connected-realms')).toBe(true)
		expect(isJobName('sync:wow:static:weekly:realms')).toBe(true)
		expect(isJobName('sync:wow:static:weekly:playable-classes')).toBe(true)
		expect(isJobName('sync:wow:static:weekly:playable-races')).toBe(true)
		expect(
			isJobName('sync:wow:static:weekly:playable-specializations'),
		).toBe(true)
		expect(isJobName('sync:wow:static:weekly:professions')).toBe(true)
		expect(isJobName('sync:wow:static:weekly:region')).toBe(true)
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

	it('validates payloads from schemas', () => {
		expect(
			parseJobPayload('sync:example', {
				profileId: 'profile-1',
				region: 'eu',
			}),
		).toEqual({
			profileId: 'profile-1',
			region: 'eu',
		})

		expect(() =>
			parseJobPayload('sync:example', {
				profileId: '',
				region: 'eu',
			}),
		).toThrow()
	})
})
