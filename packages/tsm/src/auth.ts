import { TsmAuthError } from './types/shared'
import type { TsmClientAuthOptions } from './types/shared'

const DEFAULT_CLIENT_ID = 'c260f00d-1071-409a-992f-dda2e5498536'
const DEFAULT_SCOPE = 'app:realm-api app:pricing-api'
const REFRESH_BUFFER_MS = 30_000

interface AccessTokenResponse {
	access_token: string
	expires_in: number
}

function isValidTokenResponse(value: unknown): value is AccessTokenResponse {
	if (value == null || typeof value !== 'object') {
		return false
	}

	const candidate = value as Partial<AccessTokenResponse>
	return (
		typeof candidate.access_token === 'string' &&
		typeof candidate.expires_in === 'number'
	)
}

export class TsmAuthManager {
	private readonly apiKey: string
	private readonly clientId: string
	private readonly scope: string
	private readonly fetchImpl: typeof globalThis.fetch
	private accessToken: string | null = null
	private accessTokenExpiresAt: number | null = null
	private inFlightRefresh: Promise<string> | null = null

	constructor(options: {
		auth: TsmClientAuthOptions
		fetchImpl: typeof globalThis.fetch
	}) {
		if (!options.auth.apiKey) {
			throw new TsmAuthError('TSM auth.apiKey is required')
		}

		this.apiKey = options.auth.apiKey
		this.clientId = options.auth.clientId ?? DEFAULT_CLIENT_ID
		this.scope = options.auth.scope ?? DEFAULT_SCOPE
		this.fetchImpl = options.fetchImpl
	}

	public async getToken(forceRefresh = false): Promise<string> {
		if (!forceRefresh && this.isTokenValid()) {
			return this.accessToken ?? ''
		}

		if (!forceRefresh && this.inFlightRefresh) {
			return this.inFlightRefresh
		}

		this.inFlightRefresh = this.requestNewToken()
		try {
			return await this.inFlightRefresh
		} finally {
			this.inFlightRefresh = null
		}
	}

	private isTokenValid() {
		return (
			this.accessToken != null &&
			this.accessTokenExpiresAt != null &&
			Date.now() + REFRESH_BUFFER_MS < this.accessTokenExpiresAt
		)
	}

	private async requestNewToken(): Promise<string> {
		const res = await this.fetchImpl(
			'https://auth.tradeskillmaster.com/oauth2/token',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					client_id: this.clientId,
					grant_type: 'api_token',
					scope: this.scope,
					token: this.apiKey,
				}),
			},
		)

		if (!res.ok) {
			throw new TsmAuthError(
				`TSM auth failed (${res.status} ${res.statusText})`,
			)
		}

		const responseBody = await res.json()
		if (!isValidTokenResponse(responseBody)) {
			throw new TsmAuthError(
				'TSM auth returned an invalid token response',
			)
		}

		this.accessToken = responseBody.access_token
		this.accessTokenExpiresAt = Date.now() + responseBody.expires_in * 1000
		return this.accessToken
	}
}
