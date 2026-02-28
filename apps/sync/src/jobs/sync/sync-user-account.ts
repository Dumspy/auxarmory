import { AccountClient } from '@auxarmory/battlenet'
import { db } from '@auxarmory/db/client'
import { account, wowCharacterOwnership, wowGuild } from '@auxarmory/db/schema'
import { and, eq, like, notInArray, or } from 'drizzle-orm'

import { defineJob } from '../../registry'
import { JOB_PRIORITIES } from '../../types'
import { JOB_NAMES } from '../contracts'
import type { SyncUserAccountPayload } from '../contracts'
import {
	enqueueGuildSyncJob,
	getApplicationClient,
	getUserAccessToken,
	parseRegionFromProviderId,
	slugify,
} from './shared'

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

						await enqueueGuildSyncJob({
							region,
							realmSlug: discoveredGuild.realmSlug,
							nameSlug: discoveredGuild.nameSlug,
							sourceUserId: linkedAccount.userId,
							priority: JOB_PRIORITIES.RUSH,
						})
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
