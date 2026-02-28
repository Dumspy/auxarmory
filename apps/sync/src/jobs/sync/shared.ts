import { randomUUID } from 'node:crypto'

import { ApplicationClient } from '@auxarmory/battlenet'
import { auth } from '@auxarmory/auth'
import { db } from '@auxarmory/db/client'
import { wowGuildControlEvent } from '@auxarmory/db/schema'

import { env } from '../../env'
import { createQueue } from '../../queue'
import type { SyncGuildPayload } from '../contracts'

export type Region = SyncGuildPayload['region']

export interface GuildSyncData {
	id: number
	name: string
	member_count?: number
	realm: { id: number; slug: string }
	faction?: { type?: string }
}

export interface GuildRosterData {
	members: {
		rank: number
		character: {
			id: number
			name: string
			realm: { id: number; slug: string }
			level: number
			playable_class?: { id: number }
			playable_race?: { id: number }
			faction?: { type?: string }
		}
	}[]
}

export const guildQueue = createQueue()
export const GUILD_SYNC_STALE_MS = 10 * 60 * 1000
export const CLAIM_FRESHNESS_MS = 15 * 60 * 1000
export const OWNER_TOKEN_COOLDOWN_MS = 24 * 60 * 60 * 1000
export const OWNERSHIP_GRACE_MS = 24 * 60 * 60 * 1000

const battlenetRegionCredentials: Record<
	Region,
	{
		clientId?: string
		clientSecret?: string
	}
> = {
	us: {
		clientId: env.BATTLENET_US_CLIENT_ID,
		clientSecret: env.BATTLENET_US_CLIENT_SECRET,
	},
	eu: {
		clientId: env.BATTLENET_EU_CLIENT_ID,
		clientSecret: env.BATTLENET_EU_CLIENT_SECRET,
	},
	kr: {
		clientId: env.BATTLENET_KR_CLIENT_ID,
		clientSecret: env.BATTLENET_KR_CLIENT_SECRET,
	},
	tw: {
		clientId: env.BATTLENET_TW_CLIENT_ID,
		clientSecret: env.BATTLENET_TW_CLIENT_SECRET,
	},
}

const appClientCache = new Map<Region, ApplicationClient>()

export const parseRegionFromProviderId = (
	providerId: string,
): Region | null => {
	if (providerId === 'battlenet-us') {
		return 'us'
	}
	if (providerId === 'battlenet-eu') {
		return 'eu'
	}
	if (providerId === 'battlenet-kr') {
		return 'kr'
	}
	if (providerId === 'battlenet-tw') {
		return 'tw'
	}

	return null
}

export const slugify = (value: string) => {
	return value
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
}

export const getApplicationClient = (region: Region) => {
	const cached = appClientCache.get(region)
	if (cached) {
		return cached
	}

	const credentials = battlenetRegionCredentials[region]
	if (!credentials.clientId || !credentials.clientSecret) {
		return null
	}

	const client = new ApplicationClient({
		region,
		clientId: credentials.clientId,
		clientSecret: credentials.clientSecret,
	})
	appClientCache.set(region, client)
	return client
}

export const getUserAccessToken = async (params: {
	userId: string
	providerId: string
	accountId?: string
}) => {
	const response = (await auth.api.getAccessToken({
		body: {
			providerId: params.providerId,
			accountId: params.accountId,
			userId: params.userId,
		},
	} as never)) as { accessToken?: string } | null

	if (!response?.accessToken) {
		return null
	}

	return response.accessToken
}

export const fetchGuildWithOwnerToken = async (params: {
	accessToken: string
	region: Region
	realmSlug: string
	nameSlug: string
}) => {
	const baseUrl = `https://${params.region}.api.blizzard.com`
	const headers = {
		Authorization: `Bearer ${params.accessToken}`,
		'Content-Type': 'application/json',
		'Battlenet-Namespace': `profile-${params.region}`,
	}

	const guildResponse = await fetch(
		`${baseUrl}/data/wow/guild/${params.realmSlug}/${params.nameSlug}`,
		{
			headers,
		},
	)

	if (!guildResponse.ok) {
		throw new Error(`guild fetch failed: ${guildResponse.status}`)
	}

	const rosterResponse = await fetch(
		`${baseUrl}/data/wow/guild/${params.realmSlug}/${params.nameSlug}/roster`,
		{
			headers,
		},
	)

	if (!rosterResponse.ok) {
		throw new Error(`roster fetch failed: ${rosterResponse.status}`)
	}

	const guildData = (await guildResponse.json()) as GuildSyncData
	const rosterData = (await rosterResponse.json()) as GuildRosterData

	return {
		guildData,
		rosterData,
	}
}

export const recordGuildControlEvent = async (params: {
	guildId: string
	actorUserId?: string | null
	eventType: string
	fromState?: string | null
	toState?: string | null
	details?: string
}) => {
	await db.insert(wowGuildControlEvent).values({
		id: randomUUID(),
		guildId: params.guildId,
		actorUserId: params.actorUserId ?? null,
		eventType: params.eventType,
		fromState: params.fromState ?? null,
		toState: params.toState ?? null,
		details: params.details,
	})
}
