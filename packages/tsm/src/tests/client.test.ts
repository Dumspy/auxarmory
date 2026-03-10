import { describe, expect, it, vi } from 'vitest'

import { createPricingClient } from '../pricing'
import { createRealmClient } from '../realm'
import { TsmAuthError } from '../types/shared'

function jsonResponse(
	body: unknown,
	status = 200,
	headers?: Record<string, string>,
) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
	})
}

function textResponse(
	body: string,
	status = 200,
	headers?: Record<string, string>,
) {
	return new Response(body, {
		status,
		headers,
	})
}

describe('tsm clients', () => {
	const isAuthCall = (request: unknown) => {
		if (request instanceof Request) {
			return request.url.includes('/oauth2/token')
		}

		return String(request).includes('/oauth2/token')
	}

	it('exposes raw openapi-fetch client handles', () => {
		const fetchImpl = vi.fn<typeof fetch>()
		const pricing = createPricingClient({
			auth: { apiKey: 'test-api-key' },
			fetch: fetchImpl,
		})
		const realm = createRealmClient({
			auth: { apiKey: 'test-api-key' },
			fetch: fetchImpl,
		})

		expect(pricing.raw).toBeDefined()
		expect(typeof pricing.raw.GET).toBe('function')
		expect(realm.raw).toBeDefined()
		expect(typeof realm.raw.GET).toBe('function')
	})

	it('reuses cached token across multiple requests', async () => {
		const fetchImpl = vi.fn<typeof fetch>()
		fetchImpl
			.mockResolvedValueOnce(
				jsonResponse({ access_token: 'token-1', expires_in: 3600 }),
			)
			.mockResolvedValueOnce(
				jsonResponse({ regionId: 1, name: 'North America' }),
			)
			.mockResolvedValueOnce(
				jsonResponse({
					regionId: 1,
					name: 'North America',
					regionPrefix: 'US',
					gmtOffset: -8,
					gameVersion: 'retail',
					lastModified: 0,
				}),
			)

		const client = createRealmClient({
			auth: { apiKey: 'test-api-key' },
			fetch: fetchImpl,
		})

		await client.getRegions()
		await client.getRegion({ regionId: 1 })

		const authCalls = fetchImpl.mock.calls.filter(([request]) =>
			isAuthCall(request),
		)
		expect(authCalls).toHaveLength(1)
	})

	it('refreshes token and retries once on 401', async () => {
		const fetchImpl = vi.fn<typeof fetch>()
		fetchImpl
			.mockResolvedValueOnce(
				jsonResponse({
					access_token: 'expired-token',
					expires_in: 3600,
				}),
			)
			.mockResolvedValueOnce(textResponse('Unauthorized', 401))
			.mockResolvedValueOnce(
				jsonResponse({ access_token: 'fresh-token', expires_in: 3600 }),
			)
			.mockResolvedValueOnce(
				jsonResponse({
					regionId: 1,
					itemId: {},
					petSpeciesId: {},
					marketValue: 100,
					quantity: 10,
					historical: 90,
					avgSalePrice: 95,
					saleRate: 0.2,
					soldPerDay: 2,
				}),
			)

		const client = createPricingClient({
			auth: { apiKey: 'test-api-key' },
			fetch: fetchImpl,
		})

		const result = await client.getRegionItem({
			regionId: 1,
			itemId: 72092,
		})
		expect(result?.marketValue).toBe(100)

		const bearerHeaders = fetchImpl.mock.calls
			.map(([request]) => (request instanceof Request ? request : null))
			.filter((request): request is Request => request != null)
			.filter((request) =>
				request.url.includes('pricing-api.tradeskillmaster.com'),
			)
			.map((request) => request.headers.get('Authorization'))

		expect(bearerHeaders).toEqual([
			'Bearer expired-token',
			'Bearer fresh-token',
		])
	})

	it('throws TsmApiError with parsed response body on non-401 failures', async () => {
		const fetchImpl = vi.fn<typeof fetch>()
		fetchImpl
			.mockResolvedValueOnce(
				jsonResponse({ access_token: 'token-1', expires_in: 3600 }),
			)
			.mockResolvedValueOnce(
				jsonResponse({ message: 'Too many requests' }, 429, {
					'Retry-After': '60',
				}),
			)

		const client = createPricingClient({
			auth: { apiKey: 'test-api-key' },
			fetch: fetchImpl,
		})

		await expect(
			client.getRegionItem({ regionId: 1, itemId: 72092 }),
		).rejects.toMatchObject({
			name: 'TsmApiError',
			status: 429,
			retryAfter: '60',
			responseBody: { message: 'Too many requests' },
		})
	})

	it('throws TsmAuthError on auth failures', async () => {
		const fetchImpl = vi.fn<typeof fetch>()
		fetchImpl.mockResolvedValueOnce(textResponse('Bad Request', 400))

		const client = createRealmClient({
			auth: { apiKey: 'test-api-key' },
			fetch: fetchImpl,
		})

		await expect(client.getRegions()).rejects.toBeInstanceOf(TsmAuthError)
	})

	it('supports direct raw client usage', async () => {
		const fetchImpl = vi.fn<typeof fetch>()
		fetchImpl
			.mockResolvedValueOnce(
				jsonResponse({ access_token: 'token-1', expires_in: 3600 }),
			)
			.mockResolvedValueOnce(
				jsonResponse({
					regionId: 1,
					name: 'North America',
					regionPrefix: 'US',
					gmtOffset: -8,
					gameVersion: 'retail',
					lastModified: 0,
				}),
			)

		const client = createRealmClient({
			auth: { apiKey: 'test-api-key' },
			fetch: fetchImpl,
		})

		const { data } = await client.raw.GET('/regions/{regionId}', {
			params: { path: { regionId: 1 } },
		})

		expect(data?.regionId).toBe(1)
	})

	it('throws TsmApiError for text error payloads', async () => {
		const fetchImpl = vi.fn<typeof fetch>()
		fetchImpl
			.mockResolvedValueOnce(
				jsonResponse({ access_token: 'token-1', expires_in: 3600 }),
			)
			.mockResolvedValueOnce(textResponse('service unavailable', 503))

		const client = createRealmClient({
			auth: { apiKey: 'test-api-key' },
			fetch: fetchImpl,
		})

		await expect(client.getRegions()).rejects.toEqual(
			expect.objectContaining({
				name: 'TsmApiError',
				status: 503,
				responseBody: 'service unavailable',
			}),
		)
	})

	it('can disable retry on auth failure', async () => {
		const fetchImpl = vi.fn<typeof fetch>()
		fetchImpl
			.mockResolvedValueOnce(
				jsonResponse({ access_token: 'token-1', expires_in: 3600 }),
			)
			.mockResolvedValueOnce(textResponse('Unauthorized', 401))

		const client = createRealmClient({
			auth: { apiKey: 'test-api-key' },
			fetch: fetchImpl,
			retryOnAuthFailure: false,
		})

		await expect(client.getRegions()).rejects.toEqual(
			expect.objectContaining({
				name: 'TsmApiError',
				status: 401,
			}),
		)

		const authCalls = fetchImpl.mock.calls.filter(([request]) =>
			isAuthCall(request),
		)
		expect(authCalls).toHaveLength(1)
	})
})
