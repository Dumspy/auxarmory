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
		clientId: env.BATTLENET_US_CLIENT_ID,
		clientSecret: env.BATTLENET_US_CLIENT_SECRET,
	},
	{
		region: 'eu',
		providerId: 'battlenet-eu',
		clientId: env.BATTLENET_EU_CLIENT_ID,
		clientSecret: env.BATTLENET_EU_CLIENT_SECRET,
	},
	{
		region: 'kr',
		providerId: 'battlenet-kr',
		clientId: env.BATTLENET_KR_CLIENT_ID,
		clientSecret: env.BATTLENET_KR_CLIENT_SECRET,
	},
	{
		region: 'tw',
		providerId: 'battlenet-tw',
		clientId: env.BATTLENET_TW_CLIENT_ID,
		clientSecret: env.BATTLENET_TW_CLIENT_SECRET,
	},
] as const

type BattlenetProviderConfig = (typeof battlenetRegionConfig)[number] & {
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
		...(battlenetProviders.length > 0
			? [
					genericOAuth({
						config: battlenetProviders,
					}),
				]
			: []),
	],
})
