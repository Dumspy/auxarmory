import { and, eq, inArray, sql } from 'drizzle-orm'

import { db } from '@auxarmory/db/client'
import { wowCacheRealms } from '@auxarmory/db/schema'
import { unwrap } from '@auxarmory/battlenet/unwrap'

import { defineJob } from '../../../registry.js'
import {
	completeSyncRunFailure,
	completeSyncRunSuccess,
	createBattlenetClient,
	localizeName,
	SYNC_DOMAIN,
	SYNC_PROVIDER,
	startSyncRun,
	toErrorPayload,
	WOW_STATIC_WEEKLY_REALMS_ENTITY,
	wowStaticWeeklyEntityJobPayloadSchema,
} from '../utils.js'
import type { WowStaticWeeklyEntityJobPayload } from '../utils.js'

interface RealmIndexData {
	realms: {
		id: number
		slug: string
		name: string | Record<string, string>
	}[]
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
			const client = createBattlenetClient(job.data.region)
			const index = unwrap(
				await client.wow.RealmIndex(),
			) as RealmIndexData

			const rows = index.realms
				.map((realm) => ({
					battlenetId: realm.id,
					connectedRealmId: null,
					slug: realm.slug,
					name: localizeName(realm.name) ?? realm.slug,
					payload: realm as unknown as Record<string, unknown>,
				}))
				.filter((realm) => realm.slug.length > 0)

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
