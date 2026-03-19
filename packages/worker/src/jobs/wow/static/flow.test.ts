import { describe, expect, it, vi } from 'vitest'

import {
	buildWowStaticWeeklyRegionFlow,
	ensureWowStaticWeeklyRegionFlow,
	getWowStaticWeeklyFlowJobIds,
} from './flow'

type EnsureFlowArgs = Parameters<typeof ensureWowStaticWeeklyRegionFlow>[0]

describe('wow static weekly flow helpers', () => {
	it('builds deterministic parent/child flow for a region reset', () => {
		const flow = buildWowStaticWeeklyRegionFlow({
			region: 'us',
			resetKey: 'us:2026-03-03T15:00',
			triggeredBy: 'scheduler',
		})

		expect(flow.name).toBe('sync:wow:static:weekly:region')
		expect(flow.children?.length).toBe(6)
		expect(flow.children?.map((child) => child.name)).toEqual([
			'sync:wow:static:weekly:connected-realms',
			'sync:wow:static:weekly:realms',
			'sync:wow:static:weekly:playable-classes',
			'sync:wow:static:weekly:playable-races',
			'sync:wow:static:weekly:playable-specializations',
			'sync:wow:static:weekly:professions',
		])
	})

	it('creates flow when deterministic parent job is missing', async () => {
		const queue = {
			getJob: vi.fn().mockResolvedValue(null),
		} as unknown as EnsureFlowArgs['queue']
		const flowProducer = {
			add: vi.fn().mockResolvedValue(undefined),
		} as unknown as EnsureFlowArgs['flowProducer']

		const data = {
			region: 'us',
			resetKey: 'us:2026-03-03T15:00',
			triggeredBy: 'scheduler',
		} as const

		const result = await ensureWowStaticWeeklyRegionFlow({
			queue,
			flowProducer,
			data,
		})

		expect(result).toEqual({
			created: true,
			recovered: false,
			retriedCount: 0,
			forced: false,
		})
		expect(flowProducer.add).toHaveBeenCalledTimes(1)
		expect(flowProducer.add).toHaveBeenCalledWith(
			buildWowStaticWeeklyRegionFlow(data),
		)
	})

	it('retries failed children and failed parent when flow exists', async () => {
		const data = {
			region: 'us',
			resetKey: 'us:2026-03-03T15:00',
			triggeredBy: 'scheduler',
		} as const
		const ids = getWowStaticWeeklyFlowJobIds(data)

		const failedParentJob = {
			getState: vi.fn().mockResolvedValue('failed'),
			retry: vi.fn().mockResolvedValue(undefined),
		}
		const failedChildJob = {
			getState: vi.fn().mockResolvedValue('failed'),
			retry: vi.fn().mockResolvedValue(undefined),
		}
		const completedChildJob = {
			getState: vi.fn().mockResolvedValue('completed'),
			retry: vi.fn().mockResolvedValue(undefined),
		}

		const jobsById = new Map<string, unknown>([
			[ids.parent, failedParentJob],
			[ids.children['connected-realms'], failedChildJob],
			[ids.children.realms, completedChildJob],
		])

		const queue = {
			getJob: vi.fn(async (jobId: string) => jobsById.get(jobId) ?? null),
		} as unknown as EnsureFlowArgs['queue']
		const flowProducer = {
			add: vi.fn(),
		} as unknown as EnsureFlowArgs['flowProducer']

		const result = await ensureWowStaticWeeklyRegionFlow({
			queue,
			flowProducer,
			data,
		})

		expect(result).toEqual({
			created: false,
			recovered: true,
			retriedCount: 2,
			forced: false,
		})
		expect(failedChildJob.retry).toHaveBeenCalledTimes(1)
		expect(completedChildJob.retry).not.toHaveBeenCalled()
		expect(failedParentJob.retry).toHaveBeenCalledTimes(1)
		expect(flowProducer.add).not.toHaveBeenCalled()
	})

	it('creates a fresh flow when force is enabled', async () => {
		const data = {
			region: 'us',
			resetKey: 'us:2026-03-03T15:00',
			triggeredBy: 'manual',
			force: true,
		} as const
		const ids = getWowStaticWeeklyFlowJobIds(data)

		const existingParentJob = {
			getState: vi.fn().mockResolvedValue('completed'),
			retry: vi.fn().mockResolvedValue(undefined),
		}

		const queue = {
			getJob: vi.fn(async (jobId: string) => {
				if (jobId === ids.parent) {
					return existingParentJob
				}

				return null
			}),
		} as unknown as EnsureFlowArgs['queue']
		const flowProducer = {
			add: vi.fn().mockResolvedValue(undefined),
		} as unknown as EnsureFlowArgs['flowProducer']

		const result = await ensureWowStaticWeeklyRegionFlow({
			queue,
			flowProducer,
			data,
			force: true,
		})

		expect(result).toEqual({
			created: true,
			recovered: false,
			retriedCount: 0,
			forced: true,
		})
		expect(flowProducer.add).toHaveBeenCalledTimes(1)
		expect(queue.getJob).not.toHaveBeenCalled()
	})
})
