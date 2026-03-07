import { and, eq, inArray, sql } from 'drizzle-orm'

import { db } from '@auxarmory/db/client'
import { wowCachePlayableRaces } from '@auxarmory/db/schema'
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
	WOW_STATIC_WEEKLY_PLAYABLE_RACES_ENTITY,
	wowStaticWeeklyEntityJobPayloadSchema,
} from '../utils.js'
import type { WowStaticWeeklyEntityJobPayload } from '../utils.js'

interface PlayableRaceIndexData {
	races: {
		id: number
		name: string | Record<string, string>
	}[]
}

export const syncWowStaticWeeklyPlayableRacesJob = defineJob({
	name: 'sync:wow:static:weekly:playable-races',
	description: 'Sync weekly WoW playable races cache for one region',
	allowManualRun: true,
	schema: wowStaticWeeklyEntityJobPayloadSchema,
	data: {
		region: 'us',
		resetKey: 'us:1970-01-01T00:00',
		triggeredBy: 'scheduler',
	} satisfies WowStaticWeeklyEntityJobPayload,
	handler: async function handleSyncWowStaticWeeklyPlayableRaces(job) {
		const { runId } = await startSyncRun({
			provider: SYNC_PROVIDER,
			domain: SYNC_DOMAIN,
			entity: WOW_STATIC_WEEKLY_PLAYABLE_RACES_ENTITY,
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
				await client.wow.PlayableRaceIndex(),
			) as PlayableRaceIndexData

			const rows = index.races.map((entry) => ({
				battlenetId: entry.id,
				name: localizeName(entry.name) ?? String(entry.id),
				payload: entry as unknown as Record<string, unknown>,
			}))

			const seenAt = new Date()
			let updatedCount = 0
			let insertedCount = rows.length

			if (rows.length > 0) {
				const existing = await db
					.select({ battlenetId: wowCachePlayableRaces.battlenetId })
					.from(wowCachePlayableRaces)
					.where(
						and(
							eq(wowCachePlayableRaces.region, job.data.region),
							inArray(
								wowCachePlayableRaces.battlenetId,
								rows.map((row) => row.battlenetId),
							),
						),
					)

				updatedCount = existing.length
				insertedCount = rows.length - updatedCount
			}

			if (rows.length > 0) {
				await db
					.insert(wowCachePlayableRaces)
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
							wowCachePlayableRaces.region,
							wowCachePlayableRaces.battlenetId,
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
				entity: WOW_STATIC_WEEKLY_PLAYABLE_RACES_ENTITY,
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
				entity: WOW_STATIC_WEEKLY_PLAYABLE_RACES_ENTITY,
				region: job.data.region,
				errorMessage:
					error instanceof Error ? error.message : String(error),
				errorPayload: toErrorPayload(error),
			})

			throw error
		}
	},
})
