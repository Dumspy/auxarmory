import type { z } from 'zod/v4'

import { BattlenetUnknownError } from '../errors'
import {
	normalizeBattlenetErrorsMiddleware,
	normalizeFailureAsHandled,
} from '../middleware/normalize_errors'
import type {
	BattlenetMiddleware,
	BattlenetMiddlewareContext,
	ClientRawReturn,
	ClientRequestContext,
	ClientReturn,
	RegionsEnum,
} from '../types'
import { BattlenetError } from '../types'

type Regions = z.infer<typeof RegionsEnum>

export interface BaseClientOptions {
	region: Regions
	locale?: string
	suppressZodErrors?: boolean
	middleware?: BattlenetMiddleware[]
}

export interface BaseRequestOptions<T> {
	endpoint: string
	params?: URLSearchParams
	method?: 'POST' | 'GET'
	namespace?: 'static' | 'dynamic' | 'profile'
	authorization: string
	zod: z.Schema<T>
}

export function paramsToContextObject(params: URLSearchParams) {
	const result: Record<string, string | string[]> = {}

	for (const [key, value] of params.entries()) {
		const current = result[key]
		if (current == null) {
			result[key] = value
			continue
		}

		if (Array.isArray(current)) {
			current.push(value)
			continue
		}

		result[key] = [current, value]
	}

	return result
}

export class BaseClient {
	protected region: Regions
	protected baseUrl: string
	protected locale?: string
	protected suppressZodErrors: boolean
	protected middleware: BattlenetMiddleware[]

	constructor(options: BaseClientOptions) {
		this.region = options.region
		this.locale = options.locale
		this.suppressZodErrors = options.suppressZodErrors ?? false
		this.middleware = [
			...(options.middleware ?? []),
			normalizeBattlenetErrorsMiddleware,
		]

		this.baseUrl =
			this.region === 'cn'
				? 'https://gateway.battlenet.com.cn'
				: `https://${this.region}.api.blizzard.com`
	}

	protected async executeRequest<T>(
		requestContext: ClientRequestContext,
		runner: () => Promise<ClientRawReturn<T>>,
	): Promise<ClientReturn<T>> {
		const context: BattlenetMiddlewareContext<T> = {
			request_context: requestContext,
		}

		let index = -1
		const dispatch = async (middlewareIndex: number): Promise<void> => {
			if (middlewareIndex <= index) {
				throw new Error(
					'next() called multiple times in battlenet middleware',
				)
			}
			index = middlewareIndex

			if (middlewareIndex < this.middleware.length) {
				const middleware = this.middleware[middlewareIndex]
				if (!middleware) {
					throw new Error('Battlenet middleware missing at index')
				}
				await middleware(context, () => dispatch(middlewareIndex + 1))
				return
			}

			context.response = await runner()
		}

		await dispatch(0)

		if (!context.response) {
			return {
				success: false,
				error_type: 'unknown',
				error: BattlenetUnknownError.from(
					requestContext,
					null,
					new Error(
						'Battlenet middleware chain did not produce a response',
					),
				),
				raw_data: null,
				request_context: requestContext,
				normalized: true,
			}
		}

		if (context.response.success) {
			return context.response
		}

		return normalizeFailureAsHandled<T>(context, context.response)
	}

	public async request<T>({
		endpoint,
		params = new URLSearchParams(),
		method = 'GET',
		namespace,
		zod,
		authorization,
	}: BaseRequestOptions<T>): Promise<ClientReturn<T>> {
		const url = new URL(`${this.baseUrl}/${endpoint}`)

		if (this.locale) {
			params.set('locale', this.locale)
		}

		if (params.size > 0) {
			url.search = params.toString()
		}

		const requestContext: ClientRequestContext = {
			endpoint,
			method,
			namespace,
			url: url.toString(),
			params: paramsToContextObject(params),
		}

		const headers: Record<string, string> = {
			Authorization: `Bearer ${authorization}`,
			'Content-Type': 'application/json',
		}

		if (namespace) {
			headers['Battlenet-Namespace'] = `${namespace}-${this.region}`
		}

		return this.executeRequest<T>(requestContext, async () => {
			const res = await fetch(url, {
				method,
				headers,
			})

			const bodyText = await res.text()
			const hasBody = bodyText.trim().length > 0
			let parsedJson: unknown
			let parseError: Error | null = null
			if (hasBody) {
				try {
					parsedJson = JSON.parse(bodyText)
				} catch (error) {
					parseError =
						error instanceof Error
							? error
							: new Error(String(error))
				}
			}

			if (res.ok) {
				if (!hasBody) {
					return {
						success: false,
						error_type: 'unknown',
						error: new Error(
							`Empty response: ${res.status} ${res.statusText}`,
						),
						raw_data: null,
						request_context: requestContext,
					}
				}
				if (parseError) {
					return {
						success: false,
						error_type: 'unknown',
						error: new Error(
							`Invalid JSON response: ${res.status} ${res.statusText}`,
						),
						raw_data: bodyText,
						request_context: requestContext,
					}
				}
				const parsed = zod.safeParse(parsedJson)
				if (!parsed.success) {
					if (this.suppressZodErrors) {
						return {
							success: true,
							data: parsedJson as T,
							raw_data: parsedJson as T,
							request_context: requestContext,
						}
					}

					return {
						success: false,
						error: parsed.error,
						error_type: 'zod',
						raw_data: parsedJson,
						request_context: requestContext,
					}
				}

				return {
					success: true,
					data: parsed.data,
					raw_data: parsedJson as T,
					request_context: requestContext,
				}
			}

			if (res.status === 401) {
				return {
					success: false,
					error_type: 'auth',
					error: res,
					raw_data: parsedJson,
					request_context: requestContext,
				}
			}

			if (!hasBody || parseError) {
				return {
					success: false,
					error_type: 'unknown',
					error: new Error(
						`Response ${res.status} ${res.statusText}`,
					),
					raw_data: hasBody ? bodyText : null,
					request_context: requestContext,
				}
			}

			const battlenetError = BattlenetError.safeParse(parsedJson)
			if (battlenetError.success) {
				return {
					success: false,
					error_type: 'battlenet',
					error: battlenetError.data,
					raw_data: parsedJson,
					request_context: requestContext,
				}
			}

			return {
				success: false,
				error_type: 'unknown',
				error: new Error(
					`Unknown error: ${res.status} ${res.statusText}`,
				),
				raw_data: parsedJson,
				request_context: requestContext,
			}
		})
	}
}
