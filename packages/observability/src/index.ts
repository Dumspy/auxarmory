const DEFAULT_TRACES_SAMPLE_RATE = 0.1

type Runtime = 'browser' | 'node'

interface BaseSentryOptionsInput {
	dsn: string
	environment?: string
	release?: string
	tracesSampleRate?: number | string
	service: string
	runtime: Runtime
}

interface BrowserSentryOptionsInput {
	dsn: string
	environment?: string
	release?: string
	tracesSampleRate?: number | string
	service: string
}

interface FailedJobLike {
	name: string
	id?: string | number | null
	attemptsMade?: number
	data?: unknown
}

interface ServiceErrorCaptureContextInput {
	service: string
	method?: string
	route?: string
	status?: number
}

export function resolveTracesSampleRate(
	value: number | string | undefined,
	fallback: number = DEFAULT_TRACES_SAMPLE_RATE,
) {
	const numeric = typeof value === 'string' ? Number(value) : value

	if (numeric == null || Number.isNaN(numeric)) {
		return fallback
	}

	if (numeric < 0) {
		return 0
	}

	if (numeric > 1) {
		return 1
	}

	return numeric
}

export function createBaseSentryOptions({
	dsn,
	environment,
	release,
	tracesSampleRate,
	service,
	runtime,
}: BaseSentryOptionsInput) {
	return {
		dsn,
		environment: environment ?? 'development',
		release,
		sendDefaultPii: true,
		enableLogs: true,
		tracesSampleRate: resolveTracesSampleRate(tracesSampleRate),
		initialScope: {
			tags: {
				service,
				runtime,
			},
		},
	}
}

export function createBrowserSentryOptions(input: BrowserSentryOptionsInput) {
	return createBaseSentryOptions({
		...input,
		runtime: 'browser',
	})
}

export function redactPayloadValues(payload: unknown): unknown {
	if (payload == null) {
		return payload
	}

	if (Array.isArray(payload)) {
		return payload.map(() => '[redacted]')
	}

	if (typeof payload === 'object') {
		return Object.keys(payload as Record<string, unknown>).reduce(
			(result, key) => ({
				...result,
				[key]: '[redacted]',
			}),
			{} as Record<string, string>,
		)
	}

	return '[redacted]'
}

export function getPayloadKeys(payload: unknown): string[] {
	if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
		return []
	}

	return Object.keys(payload as Record<string, unknown>)
}

export function createSyncJobFailureCaptureContext(
	job: FailedJobLike,
	error: Error,
) {
	const payloadKeys = getPayloadKeys(job.data)
	const safePayloadKeys =
		payloadKeys.length > 0 ? payloadKeys.join(', ') : 'none'

	return {
		tags: {
			service: 'sync',
			job_name: job.name,
			job_id: job.id?.toString(),
		},
		extra: {
			jobName: job.name,
			jobId: job.id,
			attemptsMade: job.attemptsMade,
			payloadKeys: safePayloadKeys,
			failedReason: error.message,
		},
		level: 'error' as const,
	}
}

export function createServiceErrorCaptureContext({
	service,
	method,
	route,
	status,
}: ServiceErrorCaptureContextInput) {
	return {
		tags: {
			service,
			runtime: 'node' as const,
			...(method ? { method } : {}),
			...(status != null ? { status_code: String(status) } : {}),
		},
		extra: {
			...(route ? { route } : {}),
			...(method ? { method } : {}),
			...(status != null ? { status } : {}),
		},
		level: 'error' as const,
	}
}
