import * as Sentry from '@sentry/node'

import { and, eq, like } from 'drizzle-orm'

import type { Regions } from '@auxarmory/battlenet/types'
import { AccountClient } from '@auxarmory/battlenet'
import { db } from '@auxarmory/db/client'
import { account } from '@auxarmory/db/schema'

import { env } from '../../env'
import {
	createBattlenetJobCaptureContext,
	createBattlenetSentryMiddleware,
} from '@auxarmory/observability'
import { persistBattlenetFailureViaInternalApi } from '../shared/battlenet_failure_sink'

const BATTLENET_PROVIDER_PREFIX = 'battlenet-'
const DEFAULT_REFRESH_BUFFER_MS = 5 * 60 * 1000

export type WowProfileRegion = Exclude<Regions, 'cn'>
export type BattlenetProviderId = `battlenet-${WowProfileRegion}`

export interface WowLinkedBattlenetAccount {
	id: string
	userId: string
	providerId: BattlenetProviderId
	region: WowProfileRegion
	providerAccountId: string
	accessToken: string | null
	refreshToken: string | null
	accessTokenExpiresAt: Date | null
	refreshTokenExpiresAt: Date | null
	scope: string | null
	createdAt: Date
	updatedAt: Date
}

export interface WowResolvedBattlenetAccount extends WowLinkedBattlenetAccount {
	accessToken: string
}

export class WowBattlenetAccountError extends Error {
	constructor(
		message: string,
		readonly code:
			| 'ACCOUNT_NOT_FOUND'
			| 'INVALID_PROVIDER'
			| 'ACCESS_TOKEN_MISSING'
			| 'REFRESH_TOKEN_MISSING'
			| 'REFRESH_TOKEN_EXPIRED'
			| 'TOKEN_REFRESH_FAILED',
	) {
		super(message)
		this.name = 'WowBattlenetAccountError'
	}
}

interface RefreshWowBattlenetAccountOptions {
	authAccountId: string
	now?: Date
}

interface ResolveWowBattlenetAccountOptions {
	authAccountId: string
	now?: Date
	refreshBufferMs?: number
	refreshIfNeeded?: boolean
}

function isWowProfileRegion(value: string): value is WowProfileRegion {
	return value === 'us' || value === 'eu' || value === 'kr' || value === 'tw'
}

export function parseWowProviderRegion(
	providerId: string,
): WowProfileRegion | null {
	if (!providerId.startsWith(BATTLENET_PROVIDER_PREFIX)) {
		return null
	}

	const region = providerId.slice(BATTLENET_PROVIDER_PREFIX.length)
	return isWowProfileRegion(region) ? region : null
}

export function isWowProviderId(
	providerId: string,
): providerId is BattlenetProviderId {
	return parseWowProviderRegion(providerId) !== null
}

function mapWowLinkedBattlenetAccount(
	row: typeof account.$inferSelect,
): WowLinkedBattlenetAccount {
	const region = parseWowProviderRegion(row.providerId)

	if (!region) {
		throw new WowBattlenetAccountError(
			`Unsupported WoW provider: ${row.providerId}`,
			'INVALID_PROVIDER',
		)
	}

	return {
		id: row.id,
		userId: row.userId,
		providerId: row.providerId as BattlenetProviderId,
		region,
		providerAccountId: row.accountId,
		accessToken: row.accessToken,
		refreshToken: row.refreshToken,
		accessTokenExpiresAt: row.accessTokenExpiresAt,
		refreshTokenExpiresAt: row.refreshTokenExpiresAt,
		scope: row.scope,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	}
}

export async function listWowLinkedBattlenetAccounts(userId?: string) {
	const conditions = [
		like(account.providerId, `${BATTLENET_PROVIDER_PREFIX}%`),
	]

	if (userId) {
		conditions.push(eq(account.userId, userId))
	}

	const rows = await db
		.select()
		.from(account)
		.where(and(...conditions))

	return rows.map(mapWowLinkedBattlenetAccount)
}

async function getWowLinkedBattlenetAccountById(authAccountId: string) {
	const [row] = await db
		.select()
		.from(account)
		.where(eq(account.id, authAccountId))
		.limit(1)

	if (!row) {
		throw new WowBattlenetAccountError(
			`WoW auth account ${authAccountId} was not found`,
			'ACCOUNT_NOT_FOUND',
		)
	}

	return mapWowLinkedBattlenetAccount(row)
}

function shouldRefreshAccessToken(args: {
	accessTokenExpiresAt: Date | null
	now: Date
	refreshBufferMs: number
}) {
	if (!args.accessTokenExpiresAt) {
		return true
	}

	return (
		args.accessTokenExpiresAt.getTime() <=
		args.now.getTime() + args.refreshBufferMs
	)
}

export async function refreshWowAccessToken(
	options: RefreshWowBattlenetAccountOptions,
) {
	const current = await getWowLinkedBattlenetAccountById(
		options.authAccountId,
	)
	const now = options.now ?? new Date()

	if (!current.refreshToken) {
		throw new WowBattlenetAccountError(
			`WoW auth account ${options.authAccountId} has no refresh token`,
			'REFRESH_TOKEN_MISSING',
		)
	}

	if (
		current.refreshTokenExpiresAt &&
		current.refreshTokenExpiresAt.getTime() <= now.getTime()
	) {
		throw new WowBattlenetAccountError(
			`WoW auth account ${options.authAccountId} refresh token is expired`,
			'REFRESH_TOKEN_EXPIRED',
		)
	}

	const response = await fetch('https://oauth.battle.net/token', {
		method: 'POST',
		headers: {
			Authorization: `Basic ${Buffer.from(`${env.BATTLENET_CLIENT_ID}:${env.BATTLENET_CLIENT_SECRET}`).toString('base64')}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: current.refreshToken,
		}),
	})

	if (!response.ok) {
		const body = await response.text()
		throw new WowBattlenetAccountError(
			`Battle.net token refresh failed (${response.status}): ${body || response.statusText}`,
			'TOKEN_REFRESH_FAILED',
		)
	}

	const payload = (await response.json()) as {
		access_token?: string
		refresh_token?: string
		expires_in?: number
		refresh_token_expires_in?: number
		scope?: string
	}

	if (!payload.access_token || typeof payload.expires_in !== 'number') {
		throw new WowBattlenetAccountError(
			'Battle.net token refresh did not return a valid access token',
			'TOKEN_REFRESH_FAILED',
		)
	}

	const accessTokenExpiresAt = new Date(
		now.getTime() + payload.expires_in * 1000,
	)
	const refreshTokenExpiresAt =
		typeof payload.refresh_token_expires_in === 'number'
			? new Date(now.getTime() + payload.refresh_token_expires_in * 1000)
			: current.refreshTokenExpiresAt

	await db
		.update(account)
		.set({
			accessToken: payload.access_token,
			refreshToken: payload.refresh_token ?? current.refreshToken,
			accessTokenExpiresAt,
			refreshTokenExpiresAt,
			scope: payload.scope ?? current.scope,
			updatedAt: now,
		})
		.where(eq(account.id, current.id))

	return getWowLinkedBattlenetAccountById(current.id)
}

export async function resolveWowBattlenetAccount(
	options: ResolveWowBattlenetAccountOptions,
): Promise<WowResolvedBattlenetAccount> {
	const now = options.now ?? new Date()
	const refreshBufferMs = options.refreshBufferMs ?? DEFAULT_REFRESH_BUFFER_MS
	const refreshIfNeeded = options.refreshIfNeeded ?? true

	let current = await getWowLinkedBattlenetAccountById(options.authAccountId)

	if (
		refreshIfNeeded &&
		shouldRefreshAccessToken({
			accessTokenExpiresAt: current.accessTokenExpiresAt,
			now,
			refreshBufferMs,
		})
	) {
		current = await refreshWowAccessToken({
			authAccountId: options.authAccountId,
			now,
		})
	}

	if (!current.accessToken) {
		throw new WowBattlenetAccountError(
			`WoW auth account ${options.authAccountId} has no access token`,
			'ACCESS_TOKEN_MISSING',
		)
	}

	return {
		...current,
		accessToken: current.accessToken,
	}
}

export async function createWowAccountClient(
	authAccountId: string,
	job: Parameters<typeof createBattlenetJobCaptureContext>[0],
	meta?: Parameters<typeof createBattlenetJobCaptureContext>[1],
): Promise<{
	account: WowResolvedBattlenetAccount
	client: AccountClient
}> {
	const resolved = await resolveWowBattlenetAccount({ authAccountId })

	const context = createBattlenetJobCaptureContext(job, meta)

	return {
		account: resolved,
		client: new AccountClient({
			region: resolved.region,
			locale: 'en_US',
			accessToken: resolved.accessToken,
			middleware: [
				createBattlenetSentryMiddleware({
					service: 'worker',
					persistFailure: persistBattlenetFailureViaInternalApi,
					captureException: (error, baseContext) => {
						Sentry.captureException(error, {
							...baseContext,
							tags: {
								...baseContext?.tags,
								...context.tags,
							},
							extra: {
								...baseContext?.extra,
								...context.extra,
							},
							contexts: {
								...baseContext?.contexts,
								...context.contexts,
							},
						})
					},
				}),
			],
		}),
	}
}
