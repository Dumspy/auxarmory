import { and, eq, inArray, sql } from 'drizzle-orm'

import { db } from '@auxarmory/db/client'
import { wowCacheRealms } from '@auxarmory/db/schema'

import { defineJob } from '../../../registry'
import {
	completeSyncRunFailure,
	completeSyncRunSuccess,
	createJobBattlenetClient,
	localizeName,
	parseConnectedRealmIdFromHref,
	unwrapBattlenetResponse,
	SYNC_DOMAIN,
	SYNC_PROVIDER,
	startSyncRun,
	toErrorPayload,
	WOW_STATIC_WEEKLY_REALMS_ENTITY,
	wowStaticWeeklyEntityJobPayloadSchema,
} from '../utils'
import type { WowStaticWeeklyEntityJobPayload } from '../utils'

interface RealmIndexData {
	realms: {
		id: number
		slug: string
		name: string | Record<string, string>
	}[]
}

interface RealmData {
	id: number
	connected_realm: {
		href: string
	}
	name: string | Record<string, string>
	category: string | Record<string, string>
	locale: string
	timezone: string
	type: {
		type: string
	}
	is_tournament: boolean
	slug: string
}

export const syncWowStaticWeeklyRealmsJob = defineJob({
	name: 'sync:wow:static:weekly:realms',
	description: 'Sync weekly WoW realm cache for one region',
	allowManualRun: true,
	schema: wowStaticWeeklyEntityJobPayloadSchema,
	data: {
		region: 'us',
		resetKey: 'us:1970-01-01T00:00',
		triggeredBy: 'scheduler',
	} satisfies WowStaticWeeklyEntityJobPayload,
	handler: async function handleSyncWowStaticWeeklyRealms(job) {
		const { runId } = await startSyncRun({
			provider: SYNC_PROVIDER,
			domain: SYNC_DOMAIN,
			entity: WOW_STATIC_WEEKLY_REALMS_ENTITY,
			region: job.data.region,
			mode: 'weekly',
			triggeredBy: job.data.triggeredBy,
			jobName: job.name,
			jobId: String(job.id ?? ''),
			scheduledFor: job.timestamp ? new Date(job.timestamp) : undefined,
			metadata: { resetKey: job.data.resetKey },
		})

		try {
			const client = createJobBattlenetClient(job, {
				entity: WOW_STATIC_WEEKLY_REALMS_ENTITY,
				runId,
			})
			const index = (await unwrapBattlenetResponse(
				client.wow.RealmIndex(),
			)) as RealmIndexData

			const rows: {
				battlenetId: number
				connectedRealmId: number | null
				slug: string
				name: string
				category: string | null
				locale: string | null
				timezone: string | null
				realmType: string | null
				isTournament: boolean | null
				payload: Record<string, unknown>
			}[] = []

			for (const realm of index.realms) {
				if (realm.slug.length === 0) {
					continue
				}

				const realmData = (await unwrapBattlenetResponse(
					client.wow.Realm(realm.slug),
				)) as RealmData

				rows.push({
					battlenetId: realmData.id,
					connectedRealmId: parseConnectedRealmIdFromHref(
						realmData.connected_realm.href,
					),
					slug: realmData.slug,
					name: localizeName(realmData.name) ?? realmData.slug,
					category: localizeName(realmData.category),
					locale: realmData.locale,
					timezone: realmData.timezone,
					realmType: realmData.type.type,
					isTournament: realmData.is_tournament,
					payload: realmData as unknown as Record<string, unknown>,
				})
			}

			const seenAt = new Date()
			let updatedCount = 0
			let insertedCount = rows.length

			if (rows.length > 0) {
				const existing = await db
					.select({ battlenetId: wowCacheRealms.battlenetId })
					.from(wowCacheRealms)
					.where(
						and(
							eq(wowCacheRealms.region, job.data.region),
							inArray(
								wowCacheRealms.battlenetId,
								rows.map((row) => row.battlenetId),
							),
						),
					)

				updatedCount = existing.length
				insertedCount = rows.length - updatedCount
			}

			if (rows.length > 0) {
				await db
					.insert(wowCacheRealms)
					.values(
						rows.map((row) => ({
							region: job.data.region,
							battlenetId: row.battlenetId,
							connectedRealmId: row.connectedRealmId,
							slug: row.slug,
							name: row.name,
							payload: row.payload,
							lastSeenAt: seenAt,
						})),
					)
					.onConflictDoUpdate({
						target: [
							wowCacheRealms.region,
							wowCacheRealms.battlenetId,
						],
						set: {
							connectedRealmId: sql`excluded.connected_realm_id`,
							slug: sql`excluded.slug`,
							name: sql`excluded.name`,
							payload: sql`excluded.payload`,
							lastSeenAt: seenAt,
							updatedAt: seenAt,
						},
					})
			}

			const processedCount = rows.length

			await completeSyncRunSuccess({
				runId,
				provider: SYNC_PROVIDER,
				domain: SYNC_DOMAIN,
				entity: WOW_STATIC_WEEKLY_REALMS_ENTITY,
				region: job.data.region,
				resetKey: job.data.resetKey,
				insertedCount,
				updatedCount,
				metadata: { resetKey: job.data.resetKey },
			})

			return {
				ok: true,
				processedCount,
			}
		} catch (error) {
			await completeSyncRunFailure({
				runId,
				provider: SYNC_PROVIDER,
				domain: SYNC_DOMAIN,
				entity: WOW_STATIC_WEEKLY_REALMS_ENTITY,
				region: job.data.region,
				errorMessage:
					error instanceof Error ? error.message : String(error),
				errorPayload: toErrorPayload(error),
			})

			throw error
		}
	},
})
