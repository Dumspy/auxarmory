import type { FlowJob, FlowProducer } from 'bullmq'

import type { WorkerQueue } from '../../../queue'
import { queueName } from '../../../queue'
import {
	formatWowStaticWeeklyEntityJobId,
	formatWowStaticWeeklyRegionJobId,
} from '../utils'
import type { WowStaticWeeklyRegionJobPayload } from '../utils'
import { syncWowStaticWeeklyConnectedRealmsJob } from './connected_realms'
import { syncWowStaticWeeklyPlayableClassesJob } from './playable_classes'
import { syncWowStaticWeeklyPlayableRacesJob } from './playable_races'
import { syncWowStaticWeeklyPlayableSpecializationsJob } from './playable_specializations'
import { syncWowStaticWeeklyProfessionsJob } from './professions'
import { syncWowStaticWeeklyRealmsJob } from './realms'
import { syncWowStaticWeeklyRegionJob } from './region'

const WEEKLY_FLOW_CHILDREN = [
	{
		entity: 'connected-realms',
		name: syncWowStaticWeeklyConnectedRealmsJob.name,
	},
	{
		entity: 'realms',
		name: syncWowStaticWeeklyRealmsJob.name,
	},
	{
		entity: 'playable-classes',
		name: syncWowStaticWeeklyPlayableClassesJob.name,
	},
	{
		entity: 'playable-races',
		name: syncWowStaticWeeklyPlayableRacesJob.name,
	},
	{
		entity: 'playable-specializations',
		name: syncWowStaticWeeklyPlayableSpecializationsJob.name,
	},
	{
		entity: 'professions',
		name: syncWowStaticWeeklyProfessionsJob.name,
	},
] as const

export type WeeklyFlowChildEntity =
	(typeof WEEKLY_FLOW_CHILDREN)[number]['entity']

export interface WowStaticWeeklyFlowJobIds {
	parent: string
	children: Record<WeeklyFlowChildEntity, string>
}

export interface EnsureWowStaticWeeklyFlowResult {
	created: boolean
	recovered: boolean
	retriedCount: number
	forced: boolean
}

export function getWowStaticWeeklyFlowJobIds(
	data: WowStaticWeeklyRegionJobPayload,
): WowStaticWeeklyFlowJobIds {
	const children = Object.fromEntries(
		WEEKLY_FLOW_CHILDREN.map((child) => [
			child.entity,
			formatWowStaticWeeklyEntityJobId(
				child.entity,
				data.region,
				data.resetKey,
			),
		]),
	) as Record<WeeklyFlowChildEntity, string>

	return {
		parent: formatWowStaticWeeklyRegionJobId(data.region, data.resetKey),
		children,
	}
}

export function buildWowStaticWeeklyRegionFlow(
	data: WowStaticWeeklyRegionJobPayload,
	options?: {
		jobIdSuffix?: string
	},
): FlowJob {
	const jobIds = getWowStaticWeeklyFlowJobIds(data)
	const suffix = options?.jobIdSuffix
	const parentJobId = suffix ? `${jobIds.parent}-${suffix}` : jobIds.parent

	return {
		name: syncWowStaticWeeklyRegionJob.name,
		queueName,
		data,
		opts: {
			jobId: parentJobId,
		},
		children: WEEKLY_FLOW_CHILDREN.map((child) => ({
			name: child.name,
			queueName,
			data,
			opts: {
				jobId: suffix
					? `${jobIds.children[child.entity]}-${suffix}`
					: jobIds.children[child.entity],
			},
		})),
	}
}

export async function ensureWowStaticWeeklyRegionFlow(args: {
	queue: WorkerQueue
	flowProducer: FlowProducer
	data: WowStaticWeeklyRegionJobPayload
	force?: boolean
}): Promise<EnsureWowStaticWeeklyFlowResult> {
	if (args.force) {
		const forceSuffix = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

		await args.flowProducer.add(
			buildWowStaticWeeklyRegionFlow(args.data, {
				jobIdSuffix: forceSuffix,
			}),
		)

		return {
			created: true,
			recovered: false,
			retriedCount: 0,
			forced: true,
		}
	}

	const flowJobIds = getWowStaticWeeklyFlowJobIds(args.data)
	const parentJob = await args.queue.getJob(flowJobIds.parent)

	if (!parentJob) {
		await args.flowProducer.add(buildWowStaticWeeklyRegionFlow(args.data))

		return {
			created: true,
			recovered: false,
			retriedCount: 0,
			forced: false,
		}
	}

	let retriedCount = 0

	for (const childJobId of Object.values(flowJobIds.children)) {
		const childJob = await args.queue.getJob(childJobId)

		if (!childJob) {
			continue
		}

		const childState = await childJob.getState()
		if (childState !== 'failed') {
			continue
		}

		await childJob.retry()
		retriedCount += 1
	}

	const parentState = await parentJob.getState()
	if (parentState === 'failed') {
		await parentJob.retry()
		retriedCount += 1
	}

	return {
		created: false,
		recovered: retriedCount > 0,
		retriedCount,
		forced: false,
	}
}
