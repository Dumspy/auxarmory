import type { ClientRequestContext } from './types'

const MAX_PREVIEW_LENGTH = 2000

export type BattlenetErrorType = 'zod' | 'auth' | 'battlenet' | 'unknown'

export interface BattlenetErrorContext {
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

export class BattlenetClientError extends Error {
	public readonly errorType: BattlenetErrorType
	public readonly context: BattlenetErrorContext

	constructor(
		message: string,
		options: {
			errorType: BattlenetErrorType
			context: BattlenetErrorContext
			cause: unknown
		},
	) {
		super(message, { cause: options.cause })
		this.name = 'BattlenetClientError'
		this.errorType = options.errorType
		this.context = options.context
	}
}

export class BattlenetZodError extends BattlenetClientError {
	constructor(
		message: string,
		options: {
			context: BattlenetErrorContext
			cause: unknown
		},
	) {
		super(message, {
			errorType: 'zod',
			context: options.context,
			cause: options.cause,
		})
		this.name = 'BattlenetZodError'
	}

	static from(
		request: ClientRequestContext,
		rawData: unknown,
		cause: unknown,
	) {
		const paramsPreview = stringifyWithLimit(request.params)
		const responsePreview = stringifyWithLimit(rawData)
		return new BattlenetZodError(
			`Battle.net response failed schema validation for ${request.endpoint}; params=${paramsPreview}; response=${responsePreview}`,
			{
				context: {
					request,
					response: rawData,
					error: cause,
				},
				cause,
			},
		)
	}
}

export class BattlenetAuthError extends BattlenetClientError {
	constructor(
		message: string,
		options: {
			context: BattlenetErrorContext
			cause: unknown
		},
	) {
		super(message, {
			errorType: 'auth',
			context: options.context,
			cause: options.cause,
		})
		this.name = 'BattlenetAuthError'
	}

	static from(
		request: ClientRequestContext,
		rawData: unknown,
		cause: unknown,
	) {
		return new BattlenetAuthError(
			`Battle.net request failed with auth error for ${request.endpoint}`,
			{
				context: {
					request,
					response: rawData,
					error: cause,
				},
				cause,
			},
		)
	}
}

export class BattlenetApiError extends BattlenetClientError {
	public readonly code: number | null

	constructor(
		message: string,
		options: {
			context: BattlenetErrorContext
			cause: unknown
		},
	) {
		super(message, {
			errorType: 'battlenet',
			context: options.context,
			cause: options.cause,
		})
		this.name = 'BattlenetApiError'
		this.code =
			typeof (options.cause as { code?: unknown })?.code === 'number'
				? ((options.cause as { code: number }).code ?? null)
				: null
	}

	static from(
		request: ClientRequestContext,
		rawData: unknown,
		cause: unknown,
	) {
		return new BattlenetApiError(
			`Battle.net request failed with battlenet error for ${request.endpoint}`,
			{
				context: {
					request,
					response: rawData,
					error: cause,
				},
				cause,
			},
		)
	}
}

export class BattlenetUnknownError extends BattlenetClientError {
	constructor(
		message: string,
		options: {
			context: BattlenetErrorContext
			cause: unknown
		},
	) {
		super(message, {
			errorType: 'unknown',
			context: options.context,
			cause: options.cause,
		})
		this.name = 'BattlenetUnknownError'
	}

	static from(
		request: ClientRequestContext,
		rawData: unknown,
		cause: unknown,
	) {
		return new BattlenetUnknownError(
			`Battle.net request failed with unknown error for ${request.endpoint}`,
			{
				context: {
					request,
					response: rawData,
					error: cause,
				},
				cause,
			},
		)
	}
}
