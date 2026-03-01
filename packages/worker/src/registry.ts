import type { Job } from 'bullmq'

export interface JobDefinition<TName extends string, TData> {
	name: TName
	data: TData
	handler?: (job: Job<TData, unknown, TName>) => Promise<unknown>
}

export function defineJob<TName extends string, TData>(
	definition: JobDefinition<TName, TData>,
): JobDefinition<TName, TData> {
	return definition
}
