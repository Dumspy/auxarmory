import type {
	BattlenetFailureSinkEvent,
	BattlenetFailureSinkResult,
	BattlenetMiddlewareEnvelope,
} from './types.js'

export interface BattlenetFailureSinkMiddlewareInput {
	service: string
	persistFailure?: (
		event: BattlenetFailureSinkEvent,
	) => Promise<{ ref: string } | null>
	baseContext?: BattlenetFailureSinkEvent['baseContext']
}

export async function persistBattlenetFailure(
	envelope: BattlenetMiddlewareEnvelope,
	input: BattlenetFailureSinkMiddlewareInput,
): Promise<BattlenetFailureSinkResult> {
	if (!input.persistFailure) {
		return { status: 'skipped' }
	}

	const event: BattlenetFailureSinkEvent = {
		request: envelope.request,
		failure: envelope.failure,
		responseMeta: envelope.responseMeta,
		errorPayload: envelope.errorPayload,
		responsePayload: envelope.responsePayload,
		service: input.service,
		timestamp: new Date().toISOString(),
		baseContext: input.baseContext,
	}

	try {
		const result = await input.persistFailure(event)
		if (!result) {
			return { status: 'skipped' }
		}

		if (!result.ref) {
			return { status: 'failed' }
		}

		return {
			status: 'persisted',
			ref: result.ref,
		}
	} catch {
		return { status: 'failed' }
	}
}
