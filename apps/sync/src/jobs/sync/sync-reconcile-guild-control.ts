import { db } from '@auxarmory/db/client'
import { wowGuild, wowGuildControl } from '@auxarmory/db/schema'
import { eq, or } from 'drizzle-orm'

import { defineJob } from '../../registry'
import { addJob, buildJobId } from '../../queue'
import { JOB_PRIORITIES } from '../../types'
import { JOB_NAMES } from '../contracts'
import type { SyncReconcileGuildControlPayload } from '../contracts'
import { CLAIM_FRESHNESS_MS, guildQueue, Region } from './shared'

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
