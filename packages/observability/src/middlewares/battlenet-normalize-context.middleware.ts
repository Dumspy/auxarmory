import type {
	BattlenetFailureLike,
	BattlenetMiddlewareEnvelope,
	BattlenetResponseMeta,
} from './types.js'

function isObjectLike(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
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

function toStringOrUndefined(value: unknown): string | undefined {
	return typeof value === 'string' ? value : undefined
}

function toResponseMeta(value: unknown): BattlenetResponseMeta {
	if (Array.isArray(value)) {
		return {
			type: 'array',
			arrayLength: value.length,
		}
	}

	if (isObjectLike(value)) {
		return {
			type: 'object',
			topLevelKeys: Object.keys(value).slice(0, 50),
		}
	}

	if (value === null) {
		return {
			type: 'null',
		}
	}

	return {
		type: typeof value,
	}
}

function toErrorPayload(error: unknown): unknown {
	if (error instanceof Error) {
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
		}
	}

	if (isObjectLike(error)) {
		return error
	}

	return {
		message: String(error),
	}
}

function collectZodIssueSummaries(error: unknown): string[] {
	if (!isObjectLike(error)) {
		return []
	}

	const issues = error.issues
	if (!Array.isArray(issues)) {
		return []
	}

	return issues.slice(0, 20).map((issue) => {
		if (!isObjectLike(issue)) {
			return String(issue)
		}

		const message =
			typeof issue.message === 'string' ? issue.message : 'Invalid value'
		const path = Array.isArray(issue.path)
			? issue.path.map(String).join('.')
			: ''

		return path.length > 0 ? `${path}: ${message}` : message
	})
}

export function normalizeBattlenetFailureEnvelope(
	response: unknown,
): BattlenetMiddlewareEnvelope | null {
	const failure = asFailure(response)
	if (!failure || failure.normalized !== true) {
		return null
	}

	const requestContext = isObjectLike(failure.request_context)
		? failure.request_context
		: null
	const errorType =
		typeof failure.error_type === 'string' ? failure.error_type : 'unknown'

	const errorPayload = toErrorPayload(failure.error)
	const responsePayload = failure.raw_data
	const zodIssues = collectZodIssueSummaries(failure.error)

	return {
		originalError: failure.error,
		request: {
			endpoint:
				toStringOrUndefined(requestContext?.endpoint) ?? 'unknown',
			method: toStringOrUndefined(requestContext?.method) ?? 'unknown',
			url: toStringOrUndefined(requestContext?.url),
			namespace: toStringOrUndefined(requestContext?.namespace),
			params:
				requestContext && 'params' in requestContext
					? requestContext.params
					: undefined,
		},
		failure: {
			errorType,
			errorName:
				typeof (errorPayload as { name?: unknown })?.name === 'string'
					? ((errorPayload as { name: string }).name ?? undefined)
					: undefined,
			errorMessage:
				typeof (errorPayload as { message?: unknown })?.message ===
				'string'
					? ((errorPayload as { message: string }).message ??
						undefined)
					: undefined,
			zodIssueCount: zodIssues.length > 0 ? zodIssues.length : undefined,
			zodIssues: zodIssues.length > 0 ? zodIssues : undefined,
		},
		responseMeta: toResponseMeta(responsePayload),
		errorPayload,
		responsePayload,
	}
}
