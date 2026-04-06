import type { ClientRequestContext, ClientReturn } from '../types'
import { ApplicationAuthResponse } from '../types'
import { WoWGameDataClient } from '../wow'
import { BaseClient, paramsToContextObject } from './base'
import type { BaseClientOptions, BaseRequestOptions } from './base'

export interface ApplicationOptions extends BaseClientOptions {
	clientId: string
	clientSecret: string
}

type ApplicationRequestOptions<T> = Omit<BaseRequestOptions<T>, 'authorization'>

export class ApplicationClient extends BaseClient {
	protected clientId: string
	protected clientSecret: string
	protected accessToken: string | null = null
	protected accessTokenExpiresAt: number | null = null
	protected authUrl: string
	public wow: WoWGameDataClient

	constructor(options: ApplicationOptions) {
		super(options)
		this.clientId = options.clientId
		this.clientSecret = options.clientSecret
		this.authUrl =
			this.region === 'cn'
				? 'https://www.battlenet.com.cn/oauth/token'
				: 'https://oauth.battle.net/token'
		this.wow = new WoWGameDataClient(this)
	}

	private async authenticate(endpoint: string): Promise<
		| { success: true; token: string }
		| {
				success: false
				error_type: 'auth'
				error: Response
				raw_data: unknown
				request_context: ClientRequestContext
		  }
		| {
				success: false
				error_type: 'unknown'
				error: Error
				raw_data: unknown
				request_context: ClientRequestContext
		  }
	> {
		if (
			this.accessToken &&
			this.accessTokenExpiresAt &&
			Date.now() < this.accessTokenExpiresAt
		) {
			return {
				success: true,
				token: this.accessToken,
			}
		}

		const url = this.authUrl
		const params = new URLSearchParams({
			grant_type: 'client_credentials',
		})

		const requestContext: ClientRequestContext = {
			endpoint,
			method: 'POST',
			url,
			params: paramsToContextObject(params),
		}

		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: params,
			})

			const authBodyText = await res.text()
			const authHasBody = authBodyText.trim().length > 0
			let authParsedJson: unknown
			if (authHasBody) {
				try {
					authParsedJson = JSON.parse(authBodyText)
				} catch {
					authParsedJson = authBodyText
				}
			}

			if (!res.ok) {
				if (res.status >= 400 && res.status < 500) {
					return {
						success: false,
						error_type: 'auth',
						error: res,
						raw_data: authHasBody ? authParsedJson : null,
						request_context: requestContext,
					}
				}

				return {
					success: false,
					error_type: 'unknown',
					error: new Error(
						`Failed to authenticate: ${res.status} ${res.statusText}`,
					),
					raw_data: authHasBody ? authParsedJson : null,
					request_context: requestContext,
				}
			}

			const parsed = ApplicationAuthResponse.safeParse(authParsedJson)

			if (!parsed.success) {
				return {
					success: false,
					error_type: 'unknown',
					error: new Error(
						`Failed to parse authentication response: ${parsed.error.message || 'Unknown error'}`,
					),
					raw_data: authParsedJson,
					request_context: requestContext,
				}
			}

			this.accessToken = parsed.data.access_token
			this.accessTokenExpiresAt =
				Date.now() + parsed.data.expires_in * 1000

			return {
				success: true,
				token: parsed.data.access_token,
			}
		} catch (error) {
			return {
				success: false,
				error_type: 'unknown',
				error:
					error instanceof Error ? error : new Error(String(error)),
				raw_data: null,
				request_context: requestContext,
			}
		}
	}

	public override async request<T>(
		opt: ApplicationRequestOptions<T>,
	): Promise<ClientReturn<T>> {
		const authResult = await this.authenticate(opt.endpoint)
		if (!authResult.success) {
			if (authResult.error_type === 'auth') {
				return this.executeRequest<T>(
					authResult.request_context,
					async () => ({
						success: false,
						error_type: 'auth',
						error: authResult.error,
						raw_data: authResult.raw_data,
						request_context: authResult.request_context,
					}),
				)
			}

			return this.executeRequest<T>(
				authResult.request_context,
				async () => ({
					success: false,
					error_type: 'unknown',
					error: authResult.error,
					raw_data: authResult.raw_data,
					request_context: authResult.request_context,
				}),
			)
		}

		return super.request({
			...opt,
			authorization: authResult.token,
		})
	}
}
