import type {
	BattlenetCaptureException,
	BattlenetCaptureScope,
	BattlenetFailureSinkResult,
	BattlenetMiddlewareEnvelope,
} from './types'

export interface BattlenetSentryCaptureInput {
	captureException: BattlenetCaptureException
	service: string
	baseExtra?: Record<string, unknown>
	baseTags?: Record<string, string | undefined>
	baseContexts?: Record<string, Record<string, unknown> | undefined>
}

export function captureBattlenetFailureToSentry(
	envelope: BattlenetMiddlewareEnvelope,
	sinkResult: BattlenetFailureSinkResult,
	input: BattlenetSentryCaptureInput,
) {
	const scope: BattlenetCaptureScope = {
		tags: {
			service: input.service,
			error_type: envelope.failure.errorType,
			method: envelope.request.method,
			failure_sink_status: sinkResult.status,
			...input.baseTags,
		},
		extra: {
			endpoint: envelope.request.endpoint,
			...input.baseExtra,
		},
		contexts: {
			battlenet_request: {
				endpoint: envelope.request.endpoint,
				method: envelope.request.method,
				url: envelope.request.url,
				namespace: envelope.request.namespace,
				params: envelope.request.params,
			},
			battlenet_error: {
				type: envelope.failure.errorType,
				name: envelope.failure.errorName,
				message: envelope.failure.errorMessage,
				zodIssueCount: envelope.failure.zodIssueCount,
				zodIssues: envelope.failure.zodIssues,
			},
			battlenet_response: {
				type: envelope.responseMeta.type,
				topLevelKeys: envelope.responseMeta.topLevelKeys,
				arrayLength: envelope.responseMeta.arrayLength,
				failureRef: sinkResult.ref,
			},
			...input.baseContexts,
		},
		level: 'error',
	}

	input.captureException(envelope.originalError, scope)
}
