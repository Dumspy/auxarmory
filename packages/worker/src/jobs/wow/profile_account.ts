import { and, eq, inArray, notInArray, sql } from 'drizzle-orm'

import { unwrap } from '@auxarmory/battlenet/unwrap'
import { db } from '@auxarmory/db/client'
import {
	wowCharacters,
	wowProfileAccountCharacters,
	wowProfileAccounts,
} from '@auxarmory/db/schema'

import { defineJob } from '../../registry.js'
import {
	completeSyncRunFailure,
	completeSyncRunSuccess,
	SYNC_PROVIDER,
	toErrorPayload,
	startSyncRun,
} from './utils.js'
import { createWowAccountClient } from './profile_accounts.js'
import {
	WOW_PROFILE_ACCOUNT_ENTITY,
	WOW_PROFILE_SYNC_DOMAIN,
	wowProfileAccountJobPayloadSchema,
} from './profile_utils.js'
import type { WowProfileAccountJobPayload } from './profile_utils.js'

function formatWowCharacterId(region: string, battlenetCharacterId: number) {
	return `${region}:${battlenetCharacterId}`
}

function formatWowProfileAccountCharacterId(
	wowProfileAccountId: string,
	characterId: string,
) {
	return `${wowProfileAccountId}:${characterId}`
}

interface AccountProfileSummaryCharacter {
	id: number
	name: string
	realm: {
		id: number
		slug: string
	}
	playable_class: {
		id: number
		name: string
	}
	playable_race: {
		id: number
		name: string
	}
	level: number
}

interface AccountProfileSummary {
	id: number
	wow_accounts: {
		id: number
		characters: AccountProfileSummaryCharacter[]
	}[]
}

export const syncWowProfileAccountJob = defineJob({
	name: 'sync:wow:profile:account',
	description:
		'Sync one linked Battle.net account roster into WoW profile tables',
	allowManualRun: true,
	schema: wowProfileAccountJobPayloadSchema,
	data: {
		authAccountId: 'auth-account-id',
		triggeredBy: 'manual',
		force: false,
	} satisfies WowProfileAccountJobPayload,
	handler: async function handleSyncWowProfileAccount(job) {
		const scopeKey = job.data.authAccountId
		const { runId } = await startSyncRun({
			provider: SYNC_PROVIDER,
			domain: WOW_PROFILE_SYNC_DOMAIN,
			entity: WOW_PROFILE_ACCOUNT_ENTITY,
			scopeKey,
			mode: 'manual',
			triggeredBy: job.data.triggeredBy,
			jobName: job.name,
			jobId: String(job.id ?? ''),
			scheduledFor: job.timestamp ? new Date(job.timestamp) : undefined,
		})

		try {
			const { account: linkedAccount, client } =
				await createWowAccountClient(job.data.authAccountId)
			const syncedAt = new Date()
			const summary = unwrap(
				await client.wow.AccountProfileSummary(),
			) as AccountProfileSummary
			const wowProfileAccountId = linkedAccount.id

			const characterSummaries = summary.wow_accounts.flatMap(
				(wowAccount: AccountProfileSummary['wow_accounts'][number]) =>
					wowAccount.characters.map(
						(
							character: AccountProfileSummary['wow_accounts'][number]['characters'][number],
						) => ({
							wowAccountId: wowAccount.id,
							characterId: character.id,
							name: character.name,
							realmId: character.realm.id,
							realmSlug: character.realm.slug,
							classId: character.playable_class.id,
							className: character.playable_class.name,
							raceId: character.playable_race.id,
							raceName: character.playable_race.name,
							level: character.level,
							summaryPayload: character as unknown as Record<
								string,
								unknown
							>,
						}),
					),
			)

			const characterIds = characterSummaries.map((character) =>
				formatWowCharacterId(
					linkedAccount.region,
					character.characterId,
				),
			)

			const existingProfileAccount = await db
				.select({ id: wowProfileAccounts.id })
				.from(wowProfileAccounts)
				.where(eq(wowProfileAccounts.id, wowProfileAccountId))
				.limit(1)

			const existingCharacters =
				characterIds.length > 0
					? await db
							.select({ id: wowCharacters.id })
							.from(wowCharacters)
							.where(inArray(wowCharacters.id, characterIds))
					: []

			const existingCharacterIds = new Set(
				existingCharacters.map((character) => character.id),
			)

			const existingLinks =
				characterIds.length > 0
					? await db
							.select({
								characterId:
									wowProfileAccountCharacters.characterId,
							})
							.from(wowProfileAccountCharacters)
							.where(
								and(
									eq(
										wowProfileAccountCharacters.wowProfileAccountId,
										wowProfileAccountId,
									),
									inArray(
										wowProfileAccountCharacters.characterId,
										characterIds,
									),
								),
							)
					: []

			const existingLinkIds = new Set(
				existingLinks.map((link) => link.characterId),
			)

			await db
				.insert(wowProfileAccounts)
				.values({
					id: wowProfileAccountId,
					authAccountId: linkedAccount.id,
					userId: linkedAccount.userId,
					providerId: linkedAccount.providerId,
					region: linkedAccount.region,
					battlenetAccountId: linkedAccount.providerAccountId,
					profileId: summary.id,
					status: 'active',
					lastDiscoveredAt: syncedAt,
					lastSyncedAt: syncedAt,
					lastSuccessfulSyncAt: syncedAt,
					lastErrorAt: null,
					lastErrorMessage: null,
					summaryPayload: summary as unknown as Record<
						string,
						unknown
					>,
					metadata: {
						wowAccountCount: summary.wow_accounts.length,
						characterCount: characterSummaries.length,
					},
				})
				.onConflictDoUpdate({
					target: wowProfileAccounts.id,
					set: {
						providerId: sql`excluded.provider_id`,
						region: sql`excluded.region`,
						battlenetAccountId: sql`excluded.battlenet_account_id`,
						profileId: sql`excluded.profile_id`,
						status: 'active',
						lastDiscoveredAt: syncedAt,
						lastSyncedAt: syncedAt,
						lastSuccessfulSyncAt: syncedAt,
						lastErrorAt: null,
						lastErrorMessage: null,
						summaryPayload: sql`excluded.summary_payload`,
						metadata: sql`excluded.metadata`,
						updatedAt: syncedAt,
					},
				})

			if (characterSummaries.length > 0) {
				await db
					.insert(wowCharacters)
					.values(
						characterSummaries.map((character) => ({
							id: formatWowCharacterId(
								linkedAccount.region,
								character.characterId,
							),
							region: linkedAccount.region,
							battlenetCharacterId: character.characterId,
							realmId: character.realmId,
							realmSlug: character.realmSlug,
							name: character.name,
							classId: character.classId,
							className: character.className,
							raceId: character.raceId,
							raceName: character.raceName,
							level: character.level,
							lastSeenAt: syncedAt,
							summaryPayload: character.summaryPayload,
						})),
					)
					.onConflictDoUpdate({
						target: wowCharacters.id,
						set: {
							realmId: sql`excluded.realm_id`,
							realmSlug: sql`excluded.realm_slug`,
							name: sql`excluded.name`,
							classId: sql`excluded.class_id`,
							className: sql`excluded.class_name`,
							raceId: sql`excluded.race_id`,
							raceName: sql`excluded.race_name`,
							level: sql`excluded.level`,
							lastSeenAt: syncedAt,
							summaryPayload: sql`excluded.summary_payload`,
							updatedAt: syncedAt,
						},
					})

				await db
					.insert(wowProfileAccountCharacters)
					.values(
						characterSummaries.map((character) => {
							const characterId = formatWowCharacterId(
								linkedAccount.region,
								character.characterId,
							)

							return {
								id: formatWowProfileAccountCharacterId(
									wowProfileAccountId,
									characterId,
								),
								wowProfileAccountId,
								characterId,
								wowAccountId: character.wowAccountId,
								isActive: true,
								firstSeenAt: syncedAt,
								lastSeenAt: syncedAt,
								lastOwnershipSyncAt: syncedAt,
							}
						}),
					)
					.onConflictDoUpdate({
						target: wowProfileAccountCharacters.id,
						set: {
							wowAccountId: sql`excluded.wow_account_id`,
							isActive: true,
							lastSeenAt: syncedAt,
							lastOwnershipSyncAt: syncedAt,
							updatedAt: syncedAt,
						},
					})

				await db
					.update(wowProfileAccountCharacters)
					.set({
						isActive: false,
						lastOwnershipSyncAt: syncedAt,
						updatedAt: syncedAt,
					})
					.where(
						and(
							eq(
								wowProfileAccountCharacters.wowProfileAccountId,
								wowProfileAccountId,
							),
							notInArray(
								wowProfileAccountCharacters.characterId,
								characterIds,
							),
						),
					)
			}

			const insertedCount =
				(existingProfileAccount.length === 0 ? 1 : 0) +
				characterIds.filter(
					(characterId: string) =>
						!existingCharacterIds.has(characterId),
				).length +
				characterIds.filter(
					(characterId: string) => !existingLinkIds.has(characterId),
				).length

			const updatedCount =
				(existingProfileAccount.length > 0 ? 1 : 0) +
				existingCharacterIds.size +
				existingLinkIds.size

			await completeSyncRunSuccess({
				runId,
				provider: SYNC_PROVIDER,
				domain: WOW_PROFILE_SYNC_DOMAIN,
				entity: WOW_PROFILE_ACCOUNT_ENTITY,
				scopeKey,
				insertedCount,
				updatedCount,
				metadata: {
					region: linkedAccount.region,
					userId: linkedAccount.userId,
					characterCount: characterSummaries.length,
					wowAccountCount: summary.wow_accounts.length,
				},
			})

			return {
				ok: true,
				region: linkedAccount.region,
				characterCount: characterSummaries.length,
			}
		} catch (error) {
			await completeSyncRunFailure({
				runId,
				provider: SYNC_PROVIDER,
				domain: WOW_PROFILE_SYNC_DOMAIN,
				entity: WOW_PROFILE_ACCOUNT_ENTITY,
				scopeKey,
				errorMessage:
					error instanceof Error ? error.message : String(error),
				errorPayload: toErrorPayload(error),
			})

			throw error
		}
	},
})
