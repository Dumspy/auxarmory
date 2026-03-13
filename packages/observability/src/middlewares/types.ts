export interface BattlenetRequestContextLike {
	endpoint?: unknown
	method?: unknown
	url?: unknown
	params?: unknown
	namespace?: unknown
}

export interface BattlenetFailureLike {
	success: false
	normalized?: unknown
	error_type?: unknown
	error?: unknown
	raw_data?: unknown
	request_context?: BattlenetRequestContextLike
}

export interface BattlenetMiddlewareContextLike {
	response?: unknown
}

export interface BattlenetNormalizedRequestContext {
	endpoint: string
	method: string
	url?: string
	namespace?: string
	params?: unknown
}

export interface BattlenetNormalizedFailureContext {
	errorType: string
	errorName?: string
	errorMessage?: string
	zodIssueCount?: number
	zodIssues?: string[]
}

export interface BattlenetResponseMeta {
	type: string
	topLevelKeys?: string[]
	arrayLength?: number
}

export interface BattlenetMiddlewareEnvelope {
	originalError: unknown
	request: BattlenetNormalizedRequestContext
	failure: BattlenetNormalizedFailureContext
	responseMeta: BattlenetResponseMeta
	errorPayload: unknown
	responsePayload: unknown
}

export interface BattlenetFailureSinkEvent {
	request: BattlenetMiddlewareEnvelope['request']
	failure: BattlenetMiddlewareEnvelope['failure']
	responseMeta: BattlenetMiddlewareEnvelope['responseMeta']
	errorPayload: BattlenetMiddlewareEnvelope['errorPayload']
	responsePayload: BattlenetMiddlewareEnvelope['responsePayload']
	service: string
	timestamp: string
	baseContext?: {
		tags?: Record<string, string | undefined>
		extra?: Record<string, unknown>
		contexts?: Record<string, Record<string, unknown> | undefined>
	}
}

export interface BattlenetFailureSinkResult {
	status: 'persisted' | 'failed' | 'skipped'
	ref?: string
}

export interface BattlenetCaptureScope {
	tags?: Record<string, string | undefined>
	extra?: Record<string, unknown>
	contexts?: Record<string, Record<string, unknown> | undefined>
	level?: 'error' | 'warning' | 'info' | 'fatal' | 'debug'
}

export type BattlenetCaptureException = (
	error: unknown,
	scope?: BattlenetCaptureScope,
) => void
