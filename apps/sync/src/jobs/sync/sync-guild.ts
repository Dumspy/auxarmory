import { db } from '@auxarmory/db/client'
import {
	account,
	wowCharacterOwnership,
	wowGuild,
	wowGuildControl,
	wowGuildRosterMember,
} from '@auxarmory/db/schema'
import { and, eq, inArray } from 'drizzle-orm'

import { defineJob } from '../../registry'
import { JOB_NAMES } from '../contracts'
import type { SyncGuildPayload } from '../contracts'
import {
	fetchGuildWithOwnerToken,
	getApplicationClient,
	getUserAccessToken,
	GuildRosterData,
	GuildSyncData,
	OWNERSHIP_GRACE_MS,
	OWNER_TOKEN_COOLDOWN_MS,
	recordGuildControlEvent,
	Region,
} from './shared'

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
						id: `${guildRow.id}:${entry.character.realm.id}:${entry.character.id}`,
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
