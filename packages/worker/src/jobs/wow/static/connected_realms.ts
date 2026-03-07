import { and, eq, inArray, sql } from 'drizzle-orm'

import { db } from '@auxarmory/db/client'
import { wowCacheConnectedRealms } from '@auxarmory/db/schema'
import { unwrap } from '@auxarmory/battlenet/unwrap'

import { defineJob } from '../../../registry.js'
import {
	completeSyncRunFailure,
	completeSyncRunSuccess,
	createBattlenetClient,
	SYNC_DOMAIN,
	SYNC_PROVIDER,
	startSyncRun,
	toErrorPayload,
	WOW_STATIC_WEEKLY_CONNECTED_REALMS_ENTITY,
	wowStaticWeeklyEntityJobPayloadSchema,
} from '../utils.js'
import type { WowStaticWeeklyEntityJobPayload } from '../utils.js'

interface ConnectedRealmIndexData {
	connected_realms: {
		href: string
	}[]
}

interface ConnectedRealmData {
	id: number
	status: {
		type: string
	}
	population: {
		type: string
	}
}

function parseConnectedRealmId(href: string) {
	const match = href.match(/connected-realm\/(\d+)/)
	if (!match?.[1]) {
		return null
	}

	const id = Number.parseInt(match[1], 10)
	return Number.isFinite(id) ? id : null
}

export const syncWowStaticWeeklyConnectedRealmsJob = defineJob({
	name: 'sync:wow:static:weekly:connected-realms',
	description: 'Sync weekly WoW connected realm cache for one region',
	allowManualRun: true,
	schema: wowStaticWeeklyEntityJobPayloadSchema,
	data: {
		region: 'us',
		resetKey: 'us:1970-01-01T00:00',
		triggeredBy: 'scheduler',
	} satisfies WowStaticWeeklyEntityJobPayload,
	handler: async function handleSyncWowStaticWeeklyConnectedRealms(job) {
		const { runId } = await startSyncRun({
			provider: SYNC_PROVIDER,
			domain: SYNC_DOMAIN,
			entity: WOW_STATIC_WEEKLY_CONNECTED_REALMS_ENTITY,
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
				await client.wow.ConnectedRealmIndex(),
			) as ConnectedRealmIndexData

			const rows: {
				battlenetId: number
				statusType?: string | null
				populationType?: string | null
				payload: Record<string, unknown>
			}[] = []

			for (const reference of index.connected_realms) {
				const id = parseConnectedRealmId(reference.href)
				if (!id) {
					continue
				}

				const connectedRealm = unwrap(
					await client.wow.ConnectedRealm(id),
				) as ConnectedRealmData

				rows.push({
					battlenetId: connectedRealm.id,
					statusType: connectedRealm.status?.type ?? null,
					populationType: connectedRealm.population?.type ?? null,
					payload: connectedRealm as unknown as Record<
						string,
						unknown
					>,
				})
			}

			const seenAt = new Date()
			let updatedCount = 0
			let insertedCount = rows.length

			if (rows.length > 0) {
				const existing = await db
					.select({
						battlenetId: wowCacheConnectedRealms.battlenetId,
					})
					.from(wowCacheConnectedRealms)
					.where(
						and(
							eq(wowCacheConnectedRealms.region, job.data.region),
							inArray(
								wowCacheConnectedRealms.battlenetId,
								rows.map((row) => row.battlenetId),
							),
						),
					)

				updatedCount = existing.length
				insertedCount = rows.length - updatedCount
			}

			if (rows.length > 0) {
				await db
					.insert(wowCacheConnectedRealms)
					.values(
						rows.map((row) => ({
							region: job.data.region,
							battlenetId: row.battlenetId,
							statusType: row.statusType ?? null,
							populationType: row.populationType ?? null,
							payload: row.payload,
							lastSeenAt: seenAt,
						})),
					)
					.onConflictDoUpdate({
						target: [
							wowCacheConnectedRealms.region,
							wowCacheConnectedRealms.battlenetId,
						],
						set: {
							statusType: sql`excluded.status_type`,
							populationType: sql`excluded.population_type`,
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
				entity: WOW_STATIC_WEEKLY_CONNECTED_REALMS_ENTITY,
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
				entity: WOW_STATIC_WEEKLY_CONNECTED_REALMS_ENTITY,
				region: job.data.region,
				errorMessage:
					error instanceof Error ? error.message : String(error),
				errorPayload: toErrorPayload(error),
			})

			throw error
		}
	},
})
