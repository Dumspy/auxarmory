import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { genericOAuth, organization } from 'better-auth/plugins'

import { db } from '@auxarmory/db/client'
import * as schema from '@auxarmory/db/schema'

import { env } from './env.js'

const trustedOrigins = env.AUTH_TRUSTED_ORIGINS.split(',').map(
	(origin: string) => origin.trim(),
)

const battlenetRegionConfig = [
	{
		region: 'us',
		providerId: 'battlenet-us',
		clientId: env.BATTLENET_CLIENT_ID,
		clientSecret: env.BATTLENET_CLIENT_SECRET,
	},
	{
		region: 'eu',
		providerId: 'battlenet-eu',
		clientId: env.BATTLENET_CLIENT_ID,
		clientSecret: env.BATTLENET_CLIENT_SECRET,
	},
	{
		region: 'kr',
		providerId: 'battlenet-kr',
		clientId: env.BATTLENET_CLIENT_ID,
		clientSecret: env.BATTLENET_CLIENT_SECRET,
	},
	{
		region: 'tw',
		providerId: 'battlenet-tw',
		clientId: env.BATTLENET_CLIENT_ID,
		clientSecret: env.BATTLENET_CLIENT_SECRET,
	},
] as const

const warcraftLogsRegionConfig = [
	{
		region: 'us',
		providerId: 'warcraftlogs-us',
		clientId: env.WARCRAFTLOGS_CLIENT_ID,
		clientSecret: env.WARCRAFTLOGS_CLIENT_SECRET,
	},
	{
		region: 'eu',
		providerId: 'warcraftlogs-eu',
		clientId: env.WARCRAFTLOGS_CLIENT_ID,
		clientSecret: env.WARCRAFTLOGS_CLIENT_SECRET,
	},
	{
		region: 'kr',
		providerId: 'warcraftlogs-kr',
		clientId: env.WARCRAFTLOGS_CLIENT_ID,
		clientSecret: env.WARCRAFTLOGS_CLIENT_SECRET,
	},
	{
		region: 'tw',
		providerId: 'warcraftlogs-tw',
		clientId: env.WARCRAFTLOGS_CLIENT_ID,
		clientSecret: env.WARCRAFTLOGS_CLIENT_SECRET,
	},
] as const

type BattlenetProviderConfig = (typeof battlenetRegionConfig)[number] & {
	clientId: string
	clientSecret: string
}

type WarcraftLogsProviderConfig = (typeof warcraftLogsRegionConfig)[number] & {
	clientId: string
	clientSecret: string
}

const battlenetProviders = battlenetRegionConfig
	.filter(
		(provider): provider is BattlenetProviderConfig =>
			typeof provider.clientId === 'string' &&
			typeof provider.clientSecret === 'string',
	)
	.map((provider) => ({
		providerId: provider.providerId,
		authorizationUrl: 'https://oauth.battle.net/authorize',
		tokenUrl: 'https://oauth.battle.net/token',
		userInfoUrl: 'https://oauth.battle.net/userinfo',
		clientId: provider.clientId,
		clientSecret: provider.clientSecret,
		scopes: ['openid', 'wow.profile'],
		getUserInfo: async (tokens: { accessToken?: string }) => {
			if (!tokens.accessToken) {
				return null
			}

			const response = await fetch('https://oauth.battle.net/userinfo', {
				headers: {
					Authorization: `Bearer ${tokens.accessToken}`,
				},
			})

			if (!response.ok) {
				return null
			}

			const profile = (await response.json()) as {
				id?: number | string
				sub?: string
				battletag?: string
			}
			const accountId = String(profile.id ?? profile.sub ?? '')

			if (!accountId) {
				return null
			}

			return {
				id: accountId,
				email: `bnet-${provider.region}-${accountId}@linked.local`,
				emailVerified: true,
				name: profile.battletag ?? `Battle.net ${accountId}`,
				battletag: profile.battletag,
				region: provider.region,
			}
		},
	}))

const warcraftLogsProviders = warcraftLogsRegionConfig
	.filter(
		(provider): provider is WarcraftLogsProviderConfig =>
			typeof provider.clientId === 'string' &&
			typeof provider.clientSecret === 'string',
	)
	.map((provider) => ({
		providerId: provider.providerId,
		authorizationUrl: 'https://www.warcraftlogs.com/oauth/authorize',
		tokenUrl: 'https://www.warcraftlogs.com/oauth/token',
		clientId: provider.clientId,
		clientSecret: provider.clientSecret,
		scopes: ['view-user-profile'],
		getUserInfo: async (tokens: { accessToken?: string }) => {
			if (!tokens.accessToken) {
				return null
			}

			const response = await fetch(
				'https://www.warcraftlogs.com/api/v2/user',
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${tokens.accessToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						query: '{ userData { currentUser { id name avatar battleTag } } }',
					}),
				},
			)

			if (!response.ok) {
				return null
			}

			const payload = (await response.json()) as {
				data?: {
					userData?: {
						currentUser?: {
							id?: number | string
							name?: string
							avatar?: string
							battleTag?: string
						}
					}
				}
			}
			const currentUser = payload.data?.userData?.currentUser
			const accountId = String(currentUser?.id ?? '')
			const name = currentUser?.name ?? ''

			if (!accountId || !name) {
				return null
			}

			return {
				id: accountId,
				email: `wcl-${provider.region}-${accountId}@linked.local`,
				emailVerified: true,
				name,
				image: currentUser?.avatar,
				battleTag: currentUser?.battleTag,
				region: provider.region,
			}
		},
	}))

if (env.NODE_ENV !== 'production') {
	const enabledProviders = [...battlenetProviders, ...warcraftLogsProviders]
		.map((provider) => provider.providerId)
		.join(', ')
	console.log(
		`[auth] enabled OAuth providers: ${
			enabledProviders.length > 0 ? enabledProviders : 'none'
		}`,
	)
}

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema,
	}),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins,
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		crossSubDomainCookies: {
			enabled: env.NODE_ENV === 'production',
			domain: env.AUTH_COOKIE_DOMAIN,
		},
		defaultCookieAttributes: {
			httpOnly: true,
			secure: env.NODE_ENV === 'production',
			sameSite: 'lax',
		},
	},
	account: {
		accountLinking: {
			allowDifferentEmails: true,
		},
	},
	plugins: [
		organization({
			teams: {
				enabled: true,
			},
		}),
		...(battlenetProviders.length > 0 || warcraftLogsProviders.length > 0
			? [
					genericOAuth({
						config: [
							...battlenetProviders,
							...warcraftLogsProviders,
						],
					}),
				]
			: []),
	],
})
