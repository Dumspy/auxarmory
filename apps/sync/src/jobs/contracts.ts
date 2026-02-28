export const JOB_NAMES = {
	SYNC_USER_ACCOUNT: 'sync:user-account',
	SYNC_GUILD: 'sync:guild',
	SYNC_SCAN_LINKED_ACCOUNTS: 'sync:scan-linked-accounts',
	SYNC_SCAN_GUILDS: 'sync:scan-guilds',
	SYNC_RECONCILE_GUILD_CONTROL: 'sync:reconcile-guild-control',
} as const

export interface SyncUserAccountPayload {
	userId: string
	providerId?: string
	accountId?: string
}

export interface SyncGuildPayload {
	guildId?: string
	region: 'us' | 'eu' | 'kr' | 'tw'
	realmSlug: string
	nameSlug: string
	sourceUserId?: string
}

export interface SyncScanLinkedAccountsPayload {
	reason?: 'repeatable' | 'manual' | 'auth-hook'
}

export interface SyncScanGuildsPayload {
	reason?: 'repeatable' | 'manual' | 'discovery'
}

export interface SyncReconcileGuildControlPayload {
	guildId?: string
	reason?: 'repeatable' | 'manual'
}

export interface JobPayloads {
	[JOB_NAMES.SYNC_USER_ACCOUNT]: SyncUserAccountPayload
	[JOB_NAMES.SYNC_GUILD]: SyncGuildPayload
	[JOB_NAMES.SYNC_SCAN_LINKED_ACCOUNTS]: SyncScanLinkedAccountsPayload
	[JOB_NAMES.SYNC_SCAN_GUILDS]: SyncScanGuildsPayload
	[JOB_NAMES.SYNC_RECONCILE_GUILD_CONTROL]: SyncReconcileGuildControlPayload
}

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES]
