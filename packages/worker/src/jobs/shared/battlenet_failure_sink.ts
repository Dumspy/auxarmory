import type { BattlenetFailureSinkEvent } from '@auxarmory/observability'

import { env } from '../../env.js'

interface PersistFailureResult {
	ref: string
}

export async function persistBattlenetFailureViaInternalApi(
	event: BattlenetFailureSinkEvent,
): Promise<PersistFailureResult | null> {
	if (!env.INTERNAL_API_TOKEN) {
		return null
	}

	const controller = new AbortController()
	const timeout = setTimeout(() => {
		controller.abort()
	}, env.FAILURE_SINK_TIMEOUT_MS)

	try {
		const response = await fetch(
			`${env.API_SERVICE_ORIGIN}/internal/failure-sink/battlenet`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-internal-token': env.INTERNAL_API_TOKEN,
				},
				body: JSON.stringify({ data: event }),
				signal: controller.signal,
			},
		)

		if (!response.ok) {
			return null
		}

		const payload = (await response.json()) as { ref?: unknown }
		if (typeof payload.ref !== 'string' || payload.ref.length === 0) {
			return null
		}

		return {
			ref: payload.ref,
		}
	} catch {
		return null
	} finally {
		clearTimeout(timeout)
	}
}
