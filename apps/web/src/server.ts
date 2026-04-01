import '../instrument.server.mjs'
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { wrapFetchWithSentry } from '@sentry/tanstackstart-react'

import { env } from './env'

const READINESS_TIMEOUT_MS = 1_500

interface UpstreamReadinessCheckResult {
	name: 'auth' | 'api'
	url: string
	ok: boolean
	error?: string
}

function createJsonResponse(body: unknown, status: number): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'no-store',
		},
	})
}

function withTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number,
	errorMessage: string,
): Promise<T> {
	return new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			reject(new Error(errorMessage))
		}, timeoutMs)

		promise
			.then((value) => {
				clearTimeout(timeoutId)
				resolve(value)
			})
			.catch((error: unknown) => {
				clearTimeout(timeoutId)
				reject(error)
			})
	})
}

async function checkUpstreamReadiness(
	name: 'auth' | 'api',
	baseUrl: string,
): Promise<UpstreamReadinessCheckResult> {
	const url = `${baseUrl}/ready`

	try {
		const response = await withTimeout(
			fetch(url, { method: 'GET' }),
			READINESS_TIMEOUT_MS,
			`${name} readiness timed out after ${READINESS_TIMEOUT_MS}ms`,
		)

		if (!response.ok) {
			return {
				name,
				url,
				ok: false,
				error: `${name} readiness returned ${response.status}`,
			}
		}

		return {
			name,
			url,
			ok: true,
		}
	} catch (error) {
		return {
			name,
			url,
			ok: false,
			error:
				error instanceof Error
					? error.message
					: 'Unknown readiness error',
		}
	}
}

async function getWebReadinessChecks(): Promise<
	UpstreamReadinessCheckResult[]
> {
	return Promise.all([
		checkUpstreamReadiness('auth', env.VITE_AUTH_URL),
		checkUpstreamReadiness('api', env.VITE_API_URL),
	])
}

const wrappedHandler = wrapFetchWithSentry({
	fetch: async (request: Request) => {
		const url = new URL(request.url)

		if (url.pathname === '/health') {
			return createJsonResponse({ status: 'ok', service: 'web' }, 200)
		}

		if (url.pathname === '/ready') {
			const checks = await getWebReadinessChecks()
			const ready = checks.every((check) => check.ok)

			if (!ready) {
				return createJsonResponse(
					{
						status: 'not_ready',
						service: 'web',
						checks,
					},
					503,
				)
			}

			return createJsonResponse(
				{ status: 'ready', service: 'web', checks },
				200,
			)
		}

		return handler.fetch(request)
	},
})

export default createServerEntry(wrappedHandler)
