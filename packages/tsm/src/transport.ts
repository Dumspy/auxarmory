import createClient from 'openapi-fetch'

import { TsmAuthManager } from './auth'
import { TsmApiError } from './types/shared'
import type { TsmClientOptions } from './types/shared'

interface CreateTsmTransportOptions {
	baseUrl: string
	options: TsmClientOptions
}

function parseBody(raw: string): unknown {
	if (!raw) {
		return null
	}

	try {
		return JSON.parse(raw)
	} catch {
		return raw
	}
}

function ensureFetch(
	fetchImpl?: typeof globalThis.fetch,
): typeof globalThis.fetch {
	const resolved = fetchImpl ?? globalThis.fetch
	if (!resolved) {
		throw new Error('Fetch implementation is required but was not found')
	}
	return resolved
}

export function createTsmTransport<TPaths extends object>({
	baseUrl,
	options,
}: CreateTsmTransportOptions) {
	const fetchImpl = ensureFetch(options.fetch)
	const authManager = new TsmAuthManager({
		auth: options.auth,
		fetchImpl,
	})
	const retryOnAuthFailure = options.retryOnAuthFailure ?? true

	const client = createClient<TPaths>({
		baseUrl,
		fetch: async (request) => {
			const execute = async (forceRefresh: boolean) => {
				const token = await authManager.getToken(forceRefresh)
				const headers = new Headers(request.headers)
				headers.set('Authorization', `Bearer ${token}`)
				const authorizedRequest = new Request(request, { headers })
				return fetchImpl(authorizedRequest)
			}

			let response = await execute(false)

			if (response.status === 401 && retryOnAuthFailure) {
				response = await execute(true)
			}

			if (response.ok) {
				return response
			}

			const endpoint = request.url
			const rawBody = await response.text()
			const body = parseBody(rawBody)
			throw new TsmApiError({
				status: response.status,
				statusText: response.statusText,
				endpoint,
				responseBody: body,
				retryAfter: response.headers.get('Retry-After'),
			})
		},
	})

	return client
}
