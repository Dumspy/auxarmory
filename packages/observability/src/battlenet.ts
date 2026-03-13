import { normalizeBattlenetFailureEnvelope } from './middlewares/battlenet-normalize-context.middleware.js'
import { persistBattlenetFailure } from './middlewares/battlenet-failure-sink.middleware.js'
import { captureBattlenetFailureToSentry } from './middlewares/battlenet-sentry.middleware.js'
import type { BattlenetFailureSinkMiddlewareInput } from './middlewares/battlenet-failure-sink.middleware.js'
import type {
	BattlenetCaptureException,
	BattlenetCaptureScope,
	BattlenetMiddlewareContextLike,
	BattlenetFailureSinkEvent,
} from './middlewares/types.js'

type BattlenetMiddlewareLike = (
	context: BattlenetMiddlewareContextLike,
	next: () => Promise<void>,
) => Promise<void>

export interface BattlenetSentryMiddlewareInput {
	captureException: BattlenetCaptureException
	service?: string
	persistFailure?: BattlenetFailureSinkMiddlewareInput['persistFailure']
	baseContext?: {
		tags?: Record<string, string | undefined>
		extra?: Record<string, unknown>
		contexts?: Record<string, Record<string, unknown> | undefined>
	}
}

export interface BattlenetJobLike {
	name: string
	id?: string | number | null
	attemptsMade?: number
	data?: unknown
}

export interface BattlenetJobMeta {
	entity?: string
	runId?: string
	region?: string
	triggeredBy?: string
	resetKey?: string
}

export type { BattlenetFailureSinkEvent }

function isObjectLike(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function getOptionalString(value: unknown): string | undefined {
	return typeof value === 'string' ? value : undefined
}

export function createBattlenetSentryMiddleware({
	captureException,
	service = 'battlenet',
	persistFailure,
	baseContext,
}: BattlenetSentryMiddlewareInput): BattlenetMiddlewareLike {
	return async (context, next) => {
		await next()

		const envelope = normalizeBattlenetFailureEnvelope(context.response)
		if (!envelope) {
			return
		}

		const sinkResult = await persistBattlenetFailure(envelope, {
			service,
			persistFailure,
			baseContext,
		})

		captureBattlenetFailureToSentry(envelope, sinkResult, {
			captureException,
			service,
			baseExtra: baseContext?.extra,
			baseTags: baseContext?.tags,
			baseContexts: baseContext?.contexts,
		})
	}
}

export function createBattlenetJobCaptureContext(
	job: BattlenetJobLike,
	meta?: BattlenetJobMeta,
) {
	const payload = isObjectLike(job.data)
		? (job.data as Record<string, unknown>)
		: null
	const region = meta?.region ?? getOptionalString(payload?.region)
	const triggeredBy =
		meta?.triggeredBy ?? getOptionalString(payload?.triggeredBy)
	const resetKey = meta?.resetKey ?? getOptionalString(payload?.resetKey)

	return {
		tags: {
			job_name: job.name,
			entity: meta?.entity,
			region,
		},
		extra: {
			jobId: job.id ?? undefined,
			attemptsMade: job.attemptsMade,
			runId: meta?.runId,
			triggeredBy,
			resetKey,
		},
		contexts: {
			sync_job: {
				jobName: job.name,
				jobId: job.id ?? undefined,
				attemptsMade: job.attemptsMade,
				runId: meta?.runId,
				entity: meta?.entity,
				region,
				triggeredBy,
				resetKey,
			},
		},
	}
}

export type BattlenetCaptureContext = BattlenetCaptureScope
