import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { platformPermissions } from '@auxarmory/auth/permissions'
import {
	createQueue,
	enqueueJobFromInput,
	getManualJobDefinitions,
	getQueueOverview,
	isJobName,
	listJobs,
	retryJobById,
} from '@auxarmory/worker/producer'
import { JOB_PRIORITIES } from '@auxarmory/worker'

import { authorizedProcedure, router } from '../index.js'

const jobNameSchema = z
	.string()
	.min(1)
	.refine(isJobName, { message: 'Unknown job name' })

const listJobsInput = z.object({
	status: z.enum(['waiting', 'active', 'delayed', 'failed', 'completed']),
	limit: z.number().int().min(1).max(100).default(20),
	offset: z.number().int().min(0).default(0),
	jobName: jobNameSchema.optional(),
})

const enqueueInput = z.object({
	name: jobNameSchema,
	payload: z.unknown(),
	priority: z.enum(['STANDARD', 'RUSH', 'CRITICAL']).default('STANDARD'),
	delayMs: z
		.number()
		.int()
		.min(0)
		.max(7 * 24 * 60 * 60 * 1000)
		.optional(),
})

const retryInput = z.object({
	jobId: z.string().min(1),
})

export interface ManualJobDefinitionDto {
	name: string
	description: string
	examplePayload: unknown
	allowManualRun: boolean
	hasSchedule: boolean
	schedule?: {
		id: string
		everyMs?: number
		pattern?: string
	}
}

export const adminJobsRouter = router({
	overview: authorizedProcedure
		.meta({ authz: platformPermissions.adminJobsRead })
		.query(async () => {
			const queue = createQueue()

			try {
				const overview = await getQueueOverview(queue)

				return {
					...overview,
					polledAt: Date.now(),
				}
			} finally {
				await queue.close()
			}
		}),
	list: authorizedProcedure
		.meta({ authz: platformPermissions.adminJobsRead })
		.input(listJobsInput)
		.query(async ({ input }) => {
			const queue = createQueue()

			try {
				const items = await listJobs(queue, input)

				return {
					items,
					nextOffset:
						items.length < input.limit
							? null
							: input.offset + input.limit,
				}
			} finally {
				await queue.close()
			}
		}),
	definitions: authorizedProcedure
		.meta({ authz: platformPermissions.adminJobsRead })
		.query(() => {
			const jobs: ManualJobDefinitionDto[] =
				getManualJobDefinitions().map((job) => ({
					name: job.name,
					description: job.description,
					examplePayload: job.examplePayload,
					allowManualRun: job.allowManualRun,
					hasSchedule: job.hasSchedule,
					schedule: job.schedule
						? {
								id: job.schedule.id,
								everyMs: job.schedule.everyMs,
								pattern: job.schedule.pattern,
							}
						: undefined,
				}))

			return {
				jobs,
			}
		}),
	enqueue: authorizedProcedure
		.meta({ authz: platformPermissions.adminJobsEnqueue })
		.input(enqueueInput)
		.mutation(async ({ input }) => {
			const queue = createQueue()

			try {
				const job = await enqueueJobFromInput(queue, {
					name: input.name,
					payload: input.payload,
					priority: JOB_PRIORITIES[input.priority],
					delayMs: input.delayMs,
				})

				return {
					jobId: String(job.id),
					name: job.name,
				}
			} catch (error) {
				if (error instanceof z.ZodError) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: error.issues
							.map((issue) => issue.message)
							.join(', '),
					})
				}

				throw error
			} finally {
				await queue.close()
			}
		}),
	retry: authorizedProcedure
		.meta({ authz: platformPermissions.adminJobsRetry })
		.input(retryInput)
		.mutation(async ({ input }) => {
			const queue = createQueue()

			try {
				const retried = await retryJobById(queue, input.jobId)

				if (!retried) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Job not found',
					})
				}

				return { ok: true }
			} finally {
				await queue.close()
			}
		}),
})
