import { describe, expect, it, vi } from 'vitest'

import {
	getManualJobDefinitions,
	getJobDependencyDetails,
	getQueueOverview,
	LISTABLE_JOB_STATUSES,
} from './index.js'
import type { ListableJobStatus } from './index.js'

describe('producer job status visibility', () => {
	it('does not expose weekly region parent as manually runnable', () => {
		const manualJobs = getManualJobDefinitions().map((job) => job.name)

		expect(manualJobs).not.toContain('sync:wow:static:weekly:region')
		expect(manualJobs).toContain('sync:wow:static:weekly:coordinator')
	})

	it('includes waiting-children in listable statuses', () => {
		expect(LISTABLE_JOB_STATUSES).toContain(
			'waiting-children' satisfies ListableJobStatus,
		)
	})

	it('requests queue counts for waiting-children', async () => {
		const queue = {
			getJobCounts: vi.fn().mockResolvedValue({
				waiting: 0,
				'waiting-children': 0,
				active: 0,
				delayed: 0,
				failed: 0,
				completed: 0,
			}),
			getJobSchedulers: vi.fn().mockResolvedValue([]),
		} as unknown as Parameters<typeof getQueueOverview>[0]

		await getQueueOverview(queue)

		expect(queue.getJobCounts).toHaveBeenCalledWith(
			...LISTABLE_JOB_STATUSES,
		)
	})

	it('returns waiting children dependency details for a parent job', async () => {
		const childWaiting = {
			id: 'child-1',
			name: 'sync:wow:static:weekly:realms',
			attemptsMade: 1,
			timestamp: 200,
			processedOn: undefined,
			finishedOn: undefined,
			failedReason: undefined,
			data: { region: 'us' },
			getState: vi.fn().mockResolvedValue('waiting'),
		}

		const childFailed = {
			id: 'child-2',
			name: 'sync:wow:static:weekly:professions',
			attemptsMade: 3,
			timestamp: 100,
			processedOn: 150,
			finishedOn: 190,
			failedReason: 'upstream error',
			data: { region: 'us' },
			getState: vi.fn().mockResolvedValue('failed'),
		}

		const parentJob = {
			getDependenciesCount: vi.fn().mockResolvedValue({
				processed: 4,
				unprocessed: 1,
				failed: 1,
				ignored: 0,
			}),
			getDependencies: vi.fn().mockResolvedValue({
				unprocessed: ['bull:battlenet-sync:child-1'],
				failed: ['bull:battlenet-sync:child-2'],
			}),
		}

		const queue = {
			getJob: vi.fn(async (jobId: string) => {
				if (jobId === 'parent-1') {
					return parentJob
				}

				if (jobId === 'child-1') {
					return childWaiting
				}

				if (jobId === 'child-2') {
					return childFailed
				}

				return null
			}),
		} as unknown as Parameters<typeof getJobDependencyDetails>[0]

		const details = await getJobDependencyDetails(queue, 'parent-1')

		expect(details).not.toBeNull()
		expect(details?.counts).toEqual({
			processed: 4,
			unprocessed: 1,
			failed: 1,
			ignored: 0,
		})
		expect(details?.waitingOn).toEqual([
			expect.objectContaining({ id: 'child-1', state: 'waiting' }),
			expect.objectContaining({
				id: 'child-2',
				state: 'failed',
				failedReason: 'upstream error',
			}),
		])
	})
})
