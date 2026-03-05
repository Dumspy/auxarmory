import type { Job } from 'bullmq'
import type { ZodType } from 'zod'

import type { JobPriority } from './types.js'

export interface JobScheduleDefinition {
	id: string
	everyMs?: number
	pattern?: string
	priority?: JobPriority
}

export interface JobDefinition<TName extends string, TData> {
	name: TName
	data: TData
	schema?: ZodType<TData>
	description?: string
	allowManualRun?: boolean
	schedule?: JobScheduleDefinition
	handler: (job: Job<TData, unknown, TName>) => Promise<unknown>
}

export function defineJob<TName extends string, TData>(
	definition: JobDefinition<TName, TData>,
): JobDefinition<TName, TData> {
	return definition
}
