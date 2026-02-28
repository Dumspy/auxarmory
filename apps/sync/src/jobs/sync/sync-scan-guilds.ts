import { db } from '@auxarmory/db/client'
import { wowGuild } from '@auxarmory/db/schema'
import { asc, isNull, lt, or } from 'drizzle-orm'

import { defineJob } from '../../registry'
import { addJob, buildJobId } from '../../queue'
import { JOB_PRIORITIES } from '../../types'
import { JOB_NAMES } from '../contracts'
import type { SyncScanGuildsPayload } from '../contracts'
import { GUILD_SYNC_STALE_MS, guildQueue, Region } from './shared'

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
