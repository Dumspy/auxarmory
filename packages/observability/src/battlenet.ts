interface BattlenetRequestContextLike {
	endpoint?: unknown
	method?: unknown
	url?: unknown
	params?: unknown
	namespace?: unknown
}

interface BattlenetFailureLike {
	success: false
	normalized?: unknown
	error_type?: unknown
	error?: unknown
	raw_data?: unknown
	request_context?: BattlenetRequestContextLike
}

interface BattlenetMiddlewareContextLike {
	response?: unknown
}

const MAX_PREVIEW_LENGTH = 2000

type BattlenetMiddlewareLike = (
	context: BattlenetMiddlewareContextLike,
	next: () => Promise<void>,
) => Promise<void>

interface BattlenetSentryMiddlewareInput {
	captureException: (
		error: unknown,
		context?: {
			tags?: Record<string, string>
			extra?: Record<string, unknown>
			level?: 'error' | 'warning' | 'info' | 'fatal' | 'debug'
		},
	) => void
	service?: string
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function stringifyWithLimit(value: unknown, maxLength = MAX_PREVIEW_LENGTH) {
	let serialized: string

	try {
		serialized = JSON.stringify(value)
	} catch {
		serialized = JSON.stringify(String(value))
	}

	if (serialized.length <= maxLength) {
		return serialized
	}

	return `${serialized.slice(0, maxLength)}... [truncated]`
}

function getFailureExtraFields(failure: BattlenetFailureLike) {
	if (!isObjectLike(failure.error)) {
		return {
			responsePreview: stringifyWithLimit(failure.raw_data),
			errorPreview: stringifyWithLimit(failure.error),
		}
	}

	const errorContext = isObjectLike(failure.error.context)
		? failure.error.context
		: null

	if (!errorContext) {
		return {
			responsePreview: stringifyWithLimit(failure.raw_data),
			errorPreview: stringifyWithLimit(failure.error),
		}
	}

	return {
		responsePreview: stringifyWithLimit(errorContext.response),
		errorPreview: stringifyWithLimit(errorContext.error),
	}
}

function asFailure(value: unknown): BattlenetFailureLike | null {
	if (!isObjectLike(value)) {
		return null
	}

	if (value.success !== false) {
		return null
	}

	return value as unknown as BattlenetFailureLike
}

export function createBattlenetSentryMiddleware({
	captureException,
	service = 'battlenet',
}: BattlenetSentryMiddlewareInput): BattlenetMiddlewareLike {
	return async (context, next) => {
		await next()

		const failure = asFailure(context.response)
		if (!failure) {
			return
		}

		if (failure.normalized !== true) {
			return
		}

		const requestContext = isObjectLike(failure.request_context)
			? failure.request_context
			: null

		const endpoint =
			typeof requestContext?.endpoint === 'string'
				? requestContext.endpoint
				: 'unknown'
		const method =
			typeof requestContext?.method === 'string'
				? requestContext.method
				: 'unknown'
		const errorType =
			typeof failure.error_type === 'string'
				? failure.error_type
				: 'unknown'

		captureException(failure.error, {
			tags: {
				service,
				error_type: errorType,
				method,
			},
			extra: {
				endpoint,
				url:
					typeof requestContext?.url === 'string'
						? requestContext.url
						: undefined,
				namespace:
					typeof requestContext?.namespace === 'string'
						? requestContext.namespace
						: undefined,
				params:
					requestContext && 'params' in requestContext
						? requestContext.params
						: undefined,
				...getFailureExtraFields(failure),
			},
			level: 'error',
		})
	}
}
