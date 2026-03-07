import type { FlowJob, FlowProducer } from 'bullmq'

import type { WorkerQueue } from '../../../queue.js'
import { queueName } from '../../../queue.js'
import {
	formatWowStaticWeeklyEntityJobId,
	formatWowStaticWeeklyRegionJobId,
} from '../utils.js'
import type { WowStaticWeeklyRegionJobPayload } from '../utils.js'
import { syncWowStaticWeeklyConnectedRealmsJob } from './connected_realms.js'
import { syncWowStaticWeeklyPlayableClassesJob } from './playable_classes.js'
import { syncWowStaticWeeklyPlayableRacesJob } from './playable_races.js'
import { syncWowStaticWeeklyPlayableSpecializationsJob } from './playable_specializations.js'
import { syncWowStaticWeeklyProfessionsJob } from './professions.js'
import { syncWowStaticWeeklyRealmsJob } from './realms.js'
import { syncWowStaticWeeklyRegionJob } from './region.js'

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
): FlowJob {
	const jobIds = getWowStaticWeeklyFlowJobIds(data)

	return {
		name: syncWowStaticWeeklyRegionJob.name,
		queueName,
		data,
		opts: {
			jobId: jobIds.parent,
		},
		children: WEEKLY_FLOW_CHILDREN.map((child) => ({
			name: child.name,
			queueName,
			data,
			opts: {
				jobId: jobIds.children[child.entity],
			},
		})),
	}
}

export async function ensureWowStaticWeeklyRegionFlow(args: {
	queue: WorkerQueue
	flowProducer: FlowProducer
	data: WowStaticWeeklyRegionJobPayload
}): Promise<EnsureWowStaticWeeklyFlowResult> {
	const flowJobIds = getWowStaticWeeklyFlowJobIds(args.data)
	const parentJob = await args.queue.getJob(flowJobIds.parent)

	if (!parentJob) {
		await args.flowProducer.add(buildWowStaticWeeklyRegionFlow(args.data))

		return {
			created: true,
			recovered: false,
			retriedCount: 0,
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
	}
}
