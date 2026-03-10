export interface TsmClientAuthOptions {
	apiKey: string
	clientId?: string
	scope?: string
}

export interface TsmClientOptions {
	auth: TsmClientAuthOptions
	fetch?: typeof globalThis.fetch
	retryOnAuthFailure?: boolean
}

export interface TsmErrorContext {
	url: string
	method: string
	body?: unknown
}

export class TsmApiError extends Error {
	public readonly status: number
	public readonly statusText: string
	public readonly endpoint: string
	public readonly responseBody: unknown
	public readonly retryAfter: string | null

	constructor(params: {
		status: number
		statusText: string
		endpoint: string
		responseBody: unknown
		retryAfter: string | null
	}) {
		super(`TSM API request failed (${params.status} ${params.statusText})`)
		this.name = 'TsmApiError'
		this.status = params.status
		this.statusText = params.statusText
		this.endpoint = params.endpoint
		this.responseBody = params.responseBody
		this.retryAfter = params.retryAfter
	}
}

export class TsmAuthError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'TsmAuthError'
	}
}
