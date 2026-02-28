import { randomUUID } from 'node:crypto'

import { AccountClient, ApplicationClient } from '@auxarmory/battlenet'
import { auth } from '@auxarmory/auth'
import { db } from '@auxarmory/db/client'
import {
	account,
	wowCharacterOwnership,
	wowGuild,
	wowGuildControl,
	wowGuildControlEvent,
	wowGuildRosterMember,
} from '@auxarmory/db/schema'
import {
	and,
	asc,
	eq,
	inArray,
	isNull,
	like,
	lt,
	notInArray,
	or,
} from 'drizzle-orm'

import { env } from '../env'
import { addJob, buildJobId, createQueue } from '../queue'
import { JOB_PRIORITIES } from '../types'
import { defineJob } from '../registry'
import { JOB_NAMES } from './contracts'
import type {
	SyncGuildPayload,
	SyncReconcileGuildControlPayload,
	SyncScanGuildsPayload,
	SyncScanLinkedAccountsPayload,
	SyncUserAccountPayload,
} from './contracts'

type Region = SyncGuildPayload['region']
interface GuildSyncData {
	id: number
	name: string
	member_count?: number
	realm: { id: number; slug: string }
	faction?: { type?: string }
}
interface GuildRosterData {
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

const guildQueue = createQueue()
const GUILD_SYNC_STALE_MS = 10 * 60 * 1000
const CLAIM_FRESHNESS_MS = 15 * 60 * 1000
const OWNER_TOKEN_COOLDOWN_MS = 24 * 60 * 60 * 1000
const OWNERSHIP_GRACE_MS = 24 * 60 * 60 * 1000

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

const parseRegionFromProviderId = (providerId: string): Region | null => {
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

const slugify = (value: string) => {
	return value
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
}

const getApplicationClient = (region: Region) => {
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

const getUserAccessToken = async (params: {
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

const fetchGuildWithOwnerToken = async (params: {
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

const recordGuildControlEvent = async (params: {
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

export const syncUserAccount = defineJob({
	name: JOB_NAMES.SYNC_USER_ACCOUNT,
	data: {
		userId: '',
		providerId: undefined as string | undefined,
		accountId: undefined as string | undefined,
	},
	handler: async (job) => {
		const payload = job.data as SyncUserAccountPayload
		console.log('[sync] sync:user-account started', {
			userId: payload.userId,
			providerId: payload.providerId,
			accountId: payload.accountId,
		})

		const accounts = await db
			.select({
				id: account.id,
				userId: account.userId,
				providerId: account.providerId,
				accountId: account.accountId,
			})
			.from(account)
			.where(
				and(
					eq(account.userId, payload.userId),
					payload.providerId
						? eq(account.providerId, payload.providerId)
						: like(account.providerId, 'battlenet-%'),
					payload.accountId
						? or(
								eq(account.id, payload.accountId),
								eq(account.accountId, payload.accountId),
							)
						: undefined,
				),
			)

		if (accounts.length === 0) {
			throw new Error(
				`No linked Battle.net accounts matched for user ${payload.userId}`,
			)
		}

		let syncedAccounts = 0
		let syncedCharacters = 0

		for (const linkedAccount of accounts) {
			const region = parseRegionFromProviderId(linkedAccount.providerId)
			if (!region) {
				continue
			}

			const userAccessToken = await getUserAccessToken({
				userId: linkedAccount.userId,
				providerId: linkedAccount.providerId,
				accountId: linkedAccount.id,
			})

			if (!userAccessToken) {
				console.warn(
					'[sync] missing user access token for linked account',
					{
						userId: linkedAccount.userId,
						providerId: linkedAccount.providerId,
						accountId: linkedAccount.accountId,
					},
				)
				continue
			}

			const accountClient = new AccountClient({
				region,
				accessToken: userAccessToken,
			})

			const summaryResult =
				await accountClient.wow.AccountProfileSummary()
			if (!summaryResult.success) {
				console.error('[sync] failed account profile summary', {
					userId: linkedAccount.userId,
					providerId: linkedAccount.providerId,
					accountId: linkedAccount.accountId,
					errorType: summaryResult.error_type,
				})
				continue
			}

			syncedAccounts += 1

			const appClient = getApplicationClient(region)
			const seenOwnershipIds: string[] = []

			for (const wowAccount of summaryResult.data.wow_accounts) {
				for (const character of wowAccount.characters) {
					syncedCharacters += 1
					let discoveredGuild:
						| {
								id: number
								name: string
								realmSlug: string
								nameSlug: string
						  }
						| undefined

					if (appClient) {
						const profileResult =
							await appClient.wow.CharacterProfileSummary(
								character.realm.slug,
								character.name,
							)

						if (profileResult.success && profileResult.data.guild) {
							discoveredGuild = {
								id: profileResult.data.guild.id,
								name: profileResult.data.guild.name,
								realmSlug: profileResult.data.guild.realm.slug,
								nameSlug: slugify(
									profileResult.data.guild.name,
								),
							}
						}
					}

					const ownershipId = `${region}:${character.realm.id}:${character.id}`
					seenOwnershipIds.push(ownershipId)

					await db
						.insert(wowCharacterOwnership)
						.values({
							id: ownershipId,
							userId: linkedAccount.userId,
							providerId: linkedAccount.providerId,
							accountId: linkedAccount.accountId,
							region,
							realmId: character.realm.id,
							realmSlug: character.realm.slug,
							characterId: character.id,
							characterName: character.name,
							guildId: discoveredGuild?.id,
							guildName: discoveredGuild?.name,
							guildRealmSlug: discoveredGuild?.realmSlug,
							guildNameSlug: discoveredGuild?.nameSlug,
							lastSeenAt: new Date(),
						})
						.onConflictDoUpdate({
							target: [
								wowCharacterOwnership.region,
								wowCharacterOwnership.realmId,
								wowCharacterOwnership.characterId,
							],
							set: {
								userId: linkedAccount.userId,
								providerId: linkedAccount.providerId,
								accountId: linkedAccount.accountId,
								realmSlug: character.realm.slug,
								characterName: character.name,
								guildId: discoveredGuild?.id,
								guildName: discoveredGuild?.name,
								guildRealmSlug: discoveredGuild?.realmSlug,
								guildNameSlug: discoveredGuild?.nameSlug,
								lastSeenAt: new Date(),
								updatedAt: new Date(),
							},
						})

					if (discoveredGuild) {
						const discoveredGuildId = `${region}:${discoveredGuild.realmSlug}:${discoveredGuild.nameSlug}`
						await db
							.insert(wowGuild)
							.values({
								id: discoveredGuildId,
								region,
								realmSlug: discoveredGuild.realmSlug,
								nameSlug: discoveredGuild.nameSlug,
								blizzardGuildId: discoveredGuild.id,
								name: discoveredGuild.name,
								realmId: character.realm.id,
								discoveredByUserId: linkedAccount.userId,
								discoveredAt: new Date(),
								lastSyncStatus: 'pending',
							})
							.onConflictDoUpdate({
								target: [
									wowGuild.region,
									wowGuild.realmSlug,
									wowGuild.nameSlug,
								],
								set: {
									blizzardGuildId: discoveredGuild.id,
									name: discoveredGuild.name,
									realmId: character.realm.id,
									discoveredByUserId: linkedAccount.userId,
									discoveredAt: new Date(),
									updatedAt: new Date(),
								},
							})

						await addJob(
							guildQueue,
							JOB_NAMES.SYNC_GUILD,
							{
								region,
								realmSlug: discoveredGuild.realmSlug,
								nameSlug: discoveredGuild.nameSlug,
								sourceUserId: linkedAccount.userId,
							},
							JOB_PRIORITIES.RUSH,
							{
								jobId: buildJobId(JOB_NAMES.SYNC_GUILD, [
									region,
									discoveredGuild.realmSlug,
									discoveredGuild.nameSlug,
								]),
							},
						)
					}
				}
			}

			if (seenOwnershipIds.length > 0) {
				await db
					.delete(wowCharacterOwnership)
					.where(
						and(
							eq(
								wowCharacterOwnership.userId,
								linkedAccount.userId,
							),
							eq(
								wowCharacterOwnership.providerId,
								linkedAccount.providerId,
							),
							eq(
								wowCharacterOwnership.accountId,
								linkedAccount.accountId,
							),
							notInArray(
								wowCharacterOwnership.id,
								seenOwnershipIds,
							),
						),
					)
			}
		}

		if (syncedAccounts === 0) {
			throw new Error(
				`Unable to sync any linked account for user ${payload.userId}. Check token refresh and provider setup.`,
			)
		}

		console.log('[sync] sync:user-account completed', {
			userId: payload.userId,
			syncedAccounts,
			syncedCharacters,
		})

		return { ok: true }
	},
})

export const syncGuild = defineJob({
	name: JOB_NAMES.SYNC_GUILD,
	data: {
		guildId: undefined as string | undefined,
		region: 'us' as Region,
		realmSlug: '',
		nameSlug: '',
		sourceUserId: undefined as string | undefined,
	},
	handler: async (job) => {
		const payload = job.data as SyncGuildPayload
		const now = new Date()

		let guildRow = payload.guildId
			? await db.query.wowGuild.findFirst({
					where: eq(wowGuild.id, payload.guildId),
				})
			: await db.query.wowGuild.findFirst({
					where: and(
						eq(wowGuild.region, payload.region),
						eq(wowGuild.realmSlug, payload.realmSlug),
						eq(wowGuild.nameSlug, payload.nameSlug),
					),
				})

		const region = (guildRow?.region ?? payload.region) as Region
		const realmSlug = guildRow?.realmSlug ?? payload.realmSlug
		const nameSlug = guildRow?.nameSlug ?? payload.nameSlug
		const guildId = guildRow?.id ?? `${region}:${realmSlug}:${nameSlug}`

		const controlRow = await db.query.wowGuildControl.findFirst({
			where: eq(wowGuildControl.guildId, guildId),
		})

		let guildData: GuildSyncData | null = null
		let rosterData: GuildRosterData | null = null

		let authSource: 'owner-token' | 'app-token' = 'app-token'
		let fallbackReason: string | undefined

		const shouldTryOwnerToken =
			controlRow?.state === 'managed' &&
			!!controlRow.ownerUserId &&
			(!guildRow?.ownerTokenCooldownUntil ||
				guildRow.ownerTokenCooldownUntil < now)

		if (shouldTryOwnerToken) {
			const ownerAccount = await db.query.account.findFirst({
				where: and(
					eq(account.userId, controlRow.ownerUserId as string),
					eq(account.providerId, `battlenet-${region}`),
				),
			})

			if (ownerAccount) {
				try {
					const ownerToken = await getUserAccessToken({
						userId: ownerAccount.userId,
						providerId: ownerAccount.providerId,
						accountId: ownerAccount.accountId,
					})

					if (!ownerToken) {
						throw new Error('missing owner token')
					}

					const result = await fetchGuildWithOwnerToken({
						accessToken: ownerToken,
						region,
						realmSlug,
						nameSlug,
					})

					guildData = result.guildData
					rosterData = result.rosterData
					authSource = 'owner-token'
				} catch (error) {
					fallbackReason =
						error instanceof Error
							? error.message
							: 'owner token fetch failed'
					await db
						.update(wowGuild)
						.set({
							ownerTokenCooldownUntil: new Date(
								now.getTime() + OWNER_TOKEN_COOLDOWN_MS,
							),
							updatedAt: now,
						})
						.where(eq(wowGuild.id, guildId))
				}
			}
		}

		if (!guildData || !rosterData) {
			const appClient = getApplicationClient(region)
			if (!appClient) {
				throw new Error(
					`Missing Battle.net app credentials for region ${region}. Cannot sync guild.`,
				)
			}

			const guildResult = await appClient.wow.Guild(realmSlug, nameSlug)
			if (!guildResult.success) {
				throw new Error(`Failed to sync guild metadata for ${guildId}`)
			}

			const rosterResult = await appClient.wow.GuildRoster(
				realmSlug,
				nameSlug,
			)
			if (!rosterResult.success) {
				throw new Error(`Failed to sync guild roster for ${guildId}`)
			}

			guildData = guildResult.data
			rosterData = rosterResult.data
			authSource = 'app-token'
		}

		await db
			.insert(wowGuild)
			.values({
				id: guildId,
				region,
				realmSlug,
				nameSlug,
				blizzardGuildId: guildData.id,
				name: guildData.name,
				realmId: guildData.realm.id,
				faction: guildData.faction?.type,
				memberCount: guildData.member_count,
				discoveredByUserId: payload.sourceUserId,
				discoveredAt: payload.sourceUserId ? now : undefined,
				lastSyncedAt: now,
				lastSyncStatus: 'ok',
				lastSyncError: null,
				lastAuthSource: authSource,
				authFallbackReason: fallbackReason,
			})
			.onConflictDoUpdate({
				target: wowGuild.id,
				set: {
					blizzardGuildId: guildData.id,
					name: guildData.name,
					realmId: guildData.realm.id,
					faction: guildData.faction?.type,
					memberCount: guildData.member_count,
					lastSyncedAt: now,
					lastSyncStatus: 'ok',
					lastSyncError: null,
					lastAuthSource: authSource,
					authFallbackReason: fallbackReason,
					updatedAt: now,
				},
			})

		guildRow = await db.query.wowGuild.findFirst({
			where: eq(wowGuild.id, guildId),
		})

		if (!guildRow) {
			throw new Error('Guild row missing after upsert')
		}

		const rosterCharacterIds = rosterData.members.map(
			(entry) => entry.character.id,
		)
		const ownershipCandidates = rosterCharacterIds.length
			? await db
					.select({
						userId: wowCharacterOwnership.userId,
						realmId: wowCharacterOwnership.realmId,
						characterId: wowCharacterOwnership.characterId,
					})
					.from(wowCharacterOwnership)
					.where(
						and(
							eq(wowCharacterOwnership.region, region),
							inArray(
								wowCharacterOwnership.characterId,
								rosterCharacterIds,
							),
						),
					)
			: []

		const ownershipByCharacter = new Map<string, string>()
		for (const entry of ownershipCandidates) {
			ownershipByCharacter.set(
				`${entry.realmId}:${entry.characterId}`,
				entry.userId,
			)
		}

		await db
			.delete(wowGuildRosterMember)
			.where(eq(wowGuildRosterMember.guildId, guildRow.id))

		if (rosterData.members.length > 0) {
			await db.insert(wowGuildRosterMember).values(
				rosterData.members.map((entry) => {
					const ownerUserId = ownershipByCharacter.get(
						`${entry.character.realm.id}:${entry.character.id}`,
					)

					return {
						id: `${guildRow?.id}:${entry.character.realm.id}:${entry.character.id}`,
						guildId: guildRow.id,
						region,
						realmId: entry.character.realm.id,
						realmSlug: entry.character.realm.slug,
						characterId: entry.character.id,
						characterName: entry.character.name,
						rank: entry.rank,
						level: entry.character.level,
						playableClassId: entry.character.playable_class?.id,
						playableRaceId: entry.character.playable_race?.id,
						factionType: entry.character.faction?.type,
						ownerUserId,
						seenAt: now,
					}
				}),
			)
		}

		const leader = await db.query.wowGuildRosterMember.findFirst({
			where: and(
				eq(wowGuildRosterMember.guildId, guildRow.id),
				eq(wowGuildRosterMember.rank, 0),
			),
		})

		const leaderUserId = leader?.ownerUserId ?? null
		const latestControl = await db.query.wowGuildControl.findFirst({
			where: eq(wowGuildControl.guildId, guildRow.id),
		})

		if (!latestControl) {
			await db.insert(wowGuildControl).values({
				guildId: guildRow.id,
				state: 'unclaimed',
				lastLeadershipCheckAt: now,
			})
		} else if (latestControl.state === 'managed') {
			if (
				latestControl.ownerUserId &&
				latestControl.ownerUserId === leaderUserId
			) {
				if (latestControl.mismatchSince || latestControl.graceEndsAt) {
					await db
						.update(wowGuildControl)
						.set({
							mismatchSince: null,
							graceEndsAt: null,
							lastLeadershipCheckAt: now,
							updatedAt: now,
						})
						.where(eq(wowGuildControl.guildId, guildRow.id))
				}
			} else if (!latestControl.mismatchSince) {
				await db
					.update(wowGuildControl)
					.set({
						mismatchSince: now,
						graceEndsAt: new Date(
							now.getTime() + OWNERSHIP_GRACE_MS,
						),
						lastLeadershipCheckAt: now,
						updatedAt: now,
					})
					.where(eq(wowGuildControl.guildId, guildRow.id))
			} else if (
				latestControl.graceEndsAt &&
				latestControl.graceEndsAt <= now
			) {
				await db
					.update(wowGuildControl)
					.set({
						state: 'orphaned',
						ownerUserId: null,
						mismatchSince: null,
						graceEndsAt: null,
						lastLeadershipCheckAt: now,
						updatedAt: now,
					})
					.where(eq(wowGuildControl.guildId, guildRow.id))

				await recordGuildControlEvent({
					guildId: guildRow.id,
					actorUserId: null,
					eventType: 'orphaned',
					fromState: 'managed',
					toState: 'orphaned',
					details:
						'Owner no longer matches leader after grace period.',
				})
			}
		}

		return {
			ok: true,
			guildId: guildRow.id,
			authSource,
		}
	},
})

export const syncScanLinkedAccounts = defineJob({
	name: JOB_NAMES.SYNC_SCAN_LINKED_ACCOUNTS,
	data: {
		reason: 'repeatable' as SyncScanLinkedAccountsPayload['reason'],
	},
	handler: async () => {
		const linkedAccounts = await db
			.select({
				userId: account.userId,
				providerId: account.providerId,
				accountId: account.accountId,
			})
			.from(account)
			.where(like(account.providerId, 'battlenet-%'))

		for (const linkedAccount of linkedAccounts) {
			await addJob(
				guildQueue,
				JOB_NAMES.SYNC_USER_ACCOUNT,
				{
					userId: linkedAccount.userId,
					providerId: linkedAccount.providerId,
					accountId: linkedAccount.accountId,
				},
				JOB_PRIORITIES.STANDARD,
				{
					jobId: buildJobId(JOB_NAMES.SYNC_USER_ACCOUNT, [
						linkedAccount.userId,
						linkedAccount.providerId,
						linkedAccount.accountId,
					]),
				},
			)
		}

		return {
			ok: true,
			count: linkedAccounts.length,
		}
	},
})

export const syncScanGuilds = defineJob({
	name: JOB_NAMES.SYNC_SCAN_GUILDS,
	data: {
		reason: 'repeatable' as SyncScanGuildsPayload['reason'],
	},
	handler: async () => {
		const staleBefore = new Date(Date.now() - GUILD_SYNC_STALE_MS)
		const guildRows = await db
			.select({
				id: wowGuild.id,
				region: wowGuild.region,
				realmSlug: wowGuild.realmSlug,
				nameSlug: wowGuild.nameSlug,
			})
			.from(wowGuild)
			.where(
				or(
					isNull(wowGuild.lastSyncedAt),
					lt(wowGuild.lastSyncedAt, staleBefore),
				),
			)
			.orderBy(asc(wowGuild.lastSyncedAt))
			.limit(200)

		for (const guildRow of guildRows) {
			await addJob(
				guildQueue,
				JOB_NAMES.SYNC_GUILD,
				{
					guildId: guildRow.id,
					region: guildRow.region as Region,
					realmSlug: guildRow.realmSlug,
					nameSlug: guildRow.nameSlug,
				},
				JOB_PRIORITIES.STANDARD,
				{
					jobId: buildJobId(JOB_NAMES.SYNC_GUILD, [
						guildRow.region,
						guildRow.realmSlug,
						guildRow.nameSlug,
					]),
				},
			)
		}

		return {
			ok: true,
			enqueued: guildRows.length,
		}
	},
})

export const syncReconcileGuildControl = defineJob({
	name: JOB_NAMES.SYNC_RECONCILE_GUILD_CONTROL,
	data: {
		guildId: undefined as string | undefined,
		reason: 'repeatable' as SyncReconcileGuildControlPayload['reason'],
	},
	handler: async (job) => {
		const payload = job.data as SyncReconcileGuildControlPayload

		const targets = payload.guildId
			? await db
					.select({
						guildId: wowGuildControl.guildId,
						region: wowGuild.region,
						realmSlug: wowGuild.realmSlug,
						nameSlug: wowGuild.nameSlug,
					})
					.from(wowGuildControl)
					.innerJoin(
						wowGuild,
						eq(wowGuild.id, wowGuildControl.guildId),
					)
					.where(eq(wowGuildControl.guildId, payload.guildId))
			: await db
					.select({
						guildId: wowGuildControl.guildId,
						region: wowGuild.region,
						realmSlug: wowGuild.realmSlug,
						nameSlug: wowGuild.nameSlug,
					})
					.from(wowGuildControl)
					.innerJoin(
						wowGuild,
						eq(wowGuild.id, wowGuildControl.guildId),
					)
					.where(
						or(
							eq(wowGuildControl.state, 'managed'),
							eq(wowGuildControl.state, 'orphaned'),
						),
					)
					.limit(200)

		for (const target of targets) {
			await addJob(
				guildQueue,
				JOB_NAMES.SYNC_GUILD,
				{
					guildId: target.guildId,
					region: target.region as Region,
					realmSlug: target.realmSlug,
					nameSlug: target.nameSlug,
				},
				JOB_PRIORITIES.RUSH,
				{
					jobId: buildJobId(JOB_NAMES.SYNC_GUILD, [
						target.region,
						target.realmSlug,
						target.nameSlug,
					]),
				},
			)
		}

		return {
			ok: true,
			enqueued: targets.length,
			claimFreshnessMs: CLAIM_FRESHNESS_MS,
		}
	},
})
