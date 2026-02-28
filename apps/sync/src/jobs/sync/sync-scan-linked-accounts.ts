import { db } from '@auxarmory/db/client'
import { account } from '@auxarmory/db/schema'
import { like } from 'drizzle-orm'

import { defineJob } from '../../registry'
import { addJob, buildJobId } from '../../queue'
import { JOB_PRIORITIES } from '../../types'
import { JOB_NAMES } from '../contracts'
import type { SyncScanLinkedAccountsPayload } from '../contracts'
import { guildQueue } from './shared'

export const syncScanLinkedAccounts = defineJob({
	name: JOB_NAMES.SYNC_SCAN_LINKED_ACCOUNTS,
	data: {
		reason: 'repeatable' as SyncScanLinkedAccountsPayload['reason'],
	},
	handler: async () => {
		const linkedAccounts = await db
			.select({
				userId: account.userId,
				providerId: account.providerId,
				accountId: account.accountId,
			})
			.from(account)
			.where(like(account.providerId, 'battlenet-%'))

		for (const linkedAccount of linkedAccounts) {
			await addJob(
				guildQueue,
				JOB_NAMES.SYNC_USER_ACCOUNT,
				{
					userId: linkedAccount.userId,
					providerId: linkedAccount.providerId,
					accountId: linkedAccount.accountId,
				},
				JOB_PRIORITIES.STANDARD,
				{
					jobId: buildJobId(JOB_NAMES.SYNC_USER_ACCOUNT, [
						linkedAccount.userId,
						linkedAccount.providerId,
						linkedAccount.accountId,
					]),
				},
			)
		}

		return {
			ok: true,
			count: linkedAccounts.length,
		}
	},
})
