import type { Job } from 'bullmq'
import { z } from 'zod'

import { syncExample, syncRepeatableExample } from './example.js'
import {
	syncWowProfileAccountCoordinatorJob,
	syncWowProfileAccountJob,
	syncWowStaticWeeklyCoordinatorJob,
	syncWowStaticWeeklyConnectedRealmsJob,
	syncWowStaticWeeklyPlayableClassesJob,
	syncWowStaticWeeklyPlayableRacesJob,
	syncWowStaticWeeklyPlayableSpecializationsJob,
	syncWowStaticWeeklyProfessionsJob,
	syncWowStaticWeeklyRegionJob,
	syncWowStaticWeeklyRealmsJob,
} from './wow/index.js'

export const jobRegistry = {
	[syncExample.name]: syncExample,
	[syncRepeatableExample.name]: syncRepeatableExample,
	[syncWowProfileAccountCoordinatorJob.name]:
		syncWowProfileAccountCoordinatorJob,
	[syncWowProfileAccountJob.name]: syncWowProfileAccountJob,
	[syncWowStaticWeeklyCoordinatorJob.name]: syncWowStaticWeeklyCoordinatorJob,
	[syncWowStaticWeeklyConnectedRealmsJob.name]:
		syncWowStaticWeeklyConnectedRealmsJob,
	[syncWowStaticWeeklyRealmsJob.name]: syncWowStaticWeeklyRealmsJob,
	[syncWowStaticWeeklyPlayableClassesJob.name]:
		syncWowStaticWeeklyPlayableClassesJob,
	[syncWowStaticWeeklyPlayableRacesJob.name]:
		syncWowStaticWeeklyPlayableRacesJob,
	[syncWowStaticWeeklyPlayableSpecializationsJob.name]:
		syncWowStaticWeeklyPlayableSpecializationsJob,
	[syncWowStaticWeeklyProfessionsJob.name]: syncWowStaticWeeklyProfessionsJob,
	[syncWowStaticWeeklyRegionJob.name]: syncWowStaticWeeklyRegionJob,
} as const

export type JobName = keyof typeof jobRegistry

export type JobPayloads = {
	[TName in JobName]: (typeof jobRegistry)[TName]['data']
}

type JobDefinitionEntry = (typeof jobRegistry)[JobName]

type JobHandler = (
	job: Job<JobPayloads[JobName], unknown, JobName>,
) => Promise<unknown>

export function getJobNames(): JobName[] {
	return Object.keys(jobRegistry) as JobName[]
}

export function isJobName(value: string): value is JobName {
	return value in jobRegistry
}

function resolveHandler(name: JobName): JobHandler | undefined {
	const entry = jobRegistry[name]
	return entry?.handler as JobHandler | undefined
}

function resolveDefinition(name: JobName): JobDefinitionEntry {
	return jobRegistry[name]
}

export function getJobDefinitions() {
	return getJobNames().map((name) => {
		const definition = resolveDefinition(name)

		return {
			name,
			description:
				definition.description ??
				`Background job for ${name.replaceAll(':', ' ')}`,
			examplePayload: definition.data,
			allowManualRun: definition.allowManualRun ?? false,
			hasSchedule: definition.schedule !== undefined,
			schedule: definition.schedule,
		}
	})
}

export function getRecurringJobDefinitions() {
	return getJobNames()
		.map((name) => {
			const definition = resolveDefinition(name)
			return definition.schedule
				? {
						name,
						payload: definition.data,
						schedule: definition.schedule,
					}
				: null
		})
		.filter((definition) => definition !== null)
}

export function parseJobPayload<TName extends JobName>(
	name: TName,
	payload: unknown,
): JobPayloads[TName] {
	const definition = resolveDefinition(name)

	if (!definition.schema) {
		return payload as JobPayloads[TName]
	}

	const result = definition.schema.safeParse(payload)

	if (!result.success) {
		throw new z.ZodError(result.error.issues)
	}

	return result.data as JobPayloads[TName]
}

export async function handleJob(
	job: Job<JobPayloads[JobName], unknown, JobName>,
): Promise<unknown> {
	const handler = resolveHandler(job.name)

	if (!handler) {
		throw new Error(`No handler registered for job: ${job.name}`)
	}

	return handler(job)
}
