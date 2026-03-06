import { and, eq, inArray, sql } from 'drizzle-orm'

import { db } from '@auxarmory/db/client'
import { wowCachePlayableClasses } from '@auxarmory/db/schema'

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
	unwrap,
	WOW_STATIC_WEEKLY_PLAYABLE_CLASSES_ENTITY,
	wowStaticWeeklyEntityJobPayloadSchema,
} from '../utils.js'
import type { WowStaticWeeklyEntityJobPayload } from '../utils.js'

interface PlayableClassIndexData {
	classes: {
		id: number
		name: string | Record<string, string>
	}[]
}

export const syncWowStaticWeeklyPlayableClassesJob = defineJob({
	name: 'sync:wow:static:weekly:playable-classes',
	description: 'Sync weekly WoW playable classes cache for one region',
	allowManualRun: true,
	schema: wowStaticWeeklyEntityJobPayloadSchema,
	data: {
		region: 'us',
		resetKey: 'us:1970-01-01T00:00',
		triggeredBy: 'scheduler',
	} satisfies WowStaticWeeklyEntityJobPayload,
	handler: async function handleSyncWowStaticWeeklyPlayableClasses(job) {
		const { runId } = await startSyncRun({
			provider: SYNC_PROVIDER,
			domain: SYNC_DOMAIN,
			entity: WOW_STATIC_WEEKLY_PLAYABLE_CLASSES_ENTITY,
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
				await client.wow.PlayableClassIndex(),
			) as PlayableClassIndexData

			const rows = index.classes.map((entry) => ({
				battlenetId: entry.id,
				name: localizeName(entry.name) ?? String(entry.id),
				payload: entry as unknown as Record<string, unknown>,
			}))

			const seenAt = new Date()
			let updatedCount = 0
			let insertedCount = rows.length

			if (rows.length > 0) {
				const existing = await db
					.select({
						battlenetId: wowCachePlayableClasses.battlenetId,
					})
					.from(wowCachePlayableClasses)
					.where(
						and(
							eq(wowCachePlayableClasses.region, job.data.region),
							inArray(
								wowCachePlayableClasses.battlenetId,
								rows.map((row) => row.battlenetId),
							),
						),
					)

				updatedCount = existing.length
				insertedCount = rows.length - updatedCount
			}

			if (rows.length > 0) {
				await db
					.insert(wowCachePlayableClasses)
					.values(
						rows.map((row) => ({
							region: job.data.region,
							battlenetId: row.battlenetId,
							name: row.name,
							payload: row.payload,
							lastSeenAt: seenAt,
						})),
					)
					.onConflictDoUpdate({
						target: [
							wowCachePlayableClasses.region,
							wowCachePlayableClasses.battlenetId,
						],
						set: {
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
				entity: WOW_STATIC_WEEKLY_PLAYABLE_CLASSES_ENTITY,
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
				entity: WOW_STATIC_WEEKLY_PLAYABLE_CLASSES_ENTITY,
				region: job.data.region,
				errorMessage:
					error instanceof Error ? error.message : String(error),
				errorPayload: toErrorPayload(error),
			})

			throw error
		}
	},
})
