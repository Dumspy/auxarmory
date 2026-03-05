import type { ClientRequestContext, ClientReturn } from './types'

const MAX_PREVIEW_LENGTH = 2000

interface UnwrapErrorContext {
	request: ClientRequestContext
	response: unknown
	error: unknown
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

export class BattlenetUnwrapError extends Error {
	public readonly errorType: 'zod' | 'auth' | 'battlenet' | 'unknown'
	public readonly context: UnwrapErrorContext

	constructor(
		message: string,
		options: {
			errorType: 'zod' | 'auth' | 'battlenet' | 'unknown'
			context: UnwrapErrorContext
			cause: unknown
		},
	) {
		super(message, { cause: options.cause })
		this.name = 'BattlenetUnwrapError'
		this.errorType = options.errorType
		this.context = options.context
	}
}

export class BattlenetZodUnwrapError extends BattlenetUnwrapError {
	constructor(
		message: string,
		options: {
			context: UnwrapErrorContext
			cause: unknown
		},
	) {
		super(message, {
			errorType: 'zod',
			context: options.context,
			cause: options.cause,
		})
		this.name = 'BattlenetZodUnwrapError'
	}
}

export function unwrap<T>(response: ClientReturn<T>): T {
	if (response.success) {
		return response.data
	}

	const context: UnwrapErrorContext = {
		request: response.request_context,
		response: response.raw_data,
		error: response.error,
	}

	if (response.error_type === 'zod') {
		const paramsPreview = stringifyWithLimit(
			response.request_context.params,
		)
		const responsePreview = stringifyWithLimit(response.raw_data)
		throw new BattlenetZodUnwrapError(
			`Battle.net response failed schema validation for ${response.request_context.endpoint}; params=${paramsPreview}; response=${responsePreview}`,
			{
				context,
				cause: response.error,
			},
		)
	}

	throw new BattlenetUnwrapError(
		`Battle.net request failed with ${response.error_type} error for ${response.request_context.endpoint}`,
		{
			errorType: response.error_type,
			context,
			cause: response.error,
		},
	)
}
