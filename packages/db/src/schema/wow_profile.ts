import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from 'drizzle-orm/pg-core'

export const wowProfileAccounts = pgTable(
	'wow_profile_accounts',
	{
		id: text('id').primaryKey(),
		authAccountId: text('auth_account_id').notNull(),
		userId: text('user_id').notNull(),
		providerId: text('provider_id').notNull(),
		region: text('region').notNull(),
		battlenetAccountId: text('battlenet_account_id'),
		profileId: integer('profile_id'),
		battletag: text('battletag'),
		status: text('status').notNull().default('active'),
		lastDiscoveredAt: timestamp('last_discovered_at').notNull(),
		lastSyncedAt: timestamp('last_synced_at'),
		lastSuccessfulSyncAt: timestamp('last_successful_sync_at'),
		lastErrorAt: timestamp('last_error_at'),
		lastErrorMessage: text('last_error_message'),
		summaryPayload:
			jsonb('summary_payload').$type<Record<string, unknown>>(),
		metadata: jsonb('metadata').$type<Record<string, unknown>>(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex('wow_profile_accounts_auth_account_uidx').on(
			table.authAccountId,
		),
		index('wow_profile_accounts_user_idx').on(table.userId),
		index('wow_profile_accounts_region_idx').on(table.region),
		index('wow_profile_accounts_status_idx').on(table.status),
	],
)

export const wowGuilds = pgTable(
	'wow_guilds',
	{
		id: text('id').primaryKey(),
		region: text('region').notNull(),
		battlenetGuildId: integer('battlenet_guild_id').notNull(),
		realmId: integer('realm_id').notNull(),
		realmSlug: text('realm_slug').notNull(),
		name: text('name').notNull(),
		nameSlug: text('name_slug'),
		factionType: text('faction_type'),
		memberCount: integer('member_count'),
		achievementPoints: integer('achievement_points'),
		crestPayload: jsonb('crest_payload').$type<Record<string, unknown>>(),
		summaryPayload:
			jsonb('summary_payload').$type<Record<string, unknown>>(),
		lastSeenAt: timestamp('last_seen_at').notNull(),
		lastProfileSyncAt: timestamp('last_profile_sync_at'),
		lastRosterSyncAt: timestamp('last_roster_sync_at'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex('wow_guilds_region_battlenet_uidx').on(
			table.region,
			table.battlenetGuildId,
		),
		index('wow_guilds_realm_idx').on(table.region, table.realmSlug),
		index('wow_guilds_name_slug_idx').on(table.region, table.nameSlug),
	],
)

export const wowCharacters = pgTable(
	'wow_characters',
	{
		id: text('id').primaryKey(),
		region: text('region').notNull(),
		battlenetCharacterId: integer('battlenet_character_id').notNull(),
		realmId: integer('realm_id').notNull(),
		realmSlug: text('realm_slug').notNull(),
		name: text('name').notNull(),
		classId: integer('class_id'),
		className: text('class_name'),
		raceId: integer('race_id'),
		raceName: text('race_name'),
		activeSpecId: integer('active_spec_id'),
		activeSpecName: text('active_spec_name'),
		level: integer('level'),
		guildId: text('guild_id').references(() => wowGuilds.id, {
			onDelete: 'set null',
		}),
		avatarUrl: text('avatar_url'),
		lastLoginAt: timestamp('last_login_at'),
		lastSeenAt: timestamp('last_seen_at').notNull(),
		lastProfileSyncAt: timestamp('last_profile_sync_at'),
		summaryPayload:
			jsonb('summary_payload').$type<Record<string, unknown>>(),
		profilePayload:
			jsonb('profile_payload').$type<Record<string, unknown>>(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex('wow_characters_region_battlenet_uidx').on(
			table.region,
			table.battlenetCharacterId,
		),
		index('wow_characters_realm_name_idx').on(
			table.region,
			table.realmSlug,
			table.name,
		),
		index('wow_characters_guild_idx').on(table.guildId),
	],
)

export const wowProfileAccountCharacters = pgTable(
	'wow_profile_account_characters',
	{
		id: text('id').primaryKey(),
		wowProfileAccountId: text('wow_profile_account_id')
			.notNull()
			.references(() => wowProfileAccounts.id, { onDelete: 'cascade' }),
		characterId: text('character_id')
			.notNull()
			.references(() => wowCharacters.id, { onDelete: 'cascade' }),
		wowAccountId: integer('wow_account_id').notNull(),
		isActive: boolean('is_active').notNull().default(true),
		firstSeenAt: timestamp('first_seen_at').notNull(),
		lastSeenAt: timestamp('last_seen_at').notNull(),
		lastOwnershipSyncAt: timestamp('last_ownership_sync_at'),
		metadata: jsonb('metadata').$type<Record<string, unknown>>(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex('wow_profile_account_characters_uidx').on(
			table.wowProfileAccountId,
			table.characterId,
		),
		index('wow_profile_account_characters_account_idx').on(
			table.wowProfileAccountId,
			table.isActive,
		),
		index('wow_profile_account_characters_character_idx').on(
			table.characterId,
		),
	],
)

export const wowCharacterDashboard = pgTable(
	'wow_character_dashboard',
	{
		characterId: text('character_id')
			.primaryKey()
			.references(() => wowCharacters.id, { onDelete: 'cascade' }),
		equippedItemLevel: integer('equipped_item_level'),
		activeSpecId: integer('active_spec_id'),
		activeSpecName: text('active_spec_name'),
		avatarUrl: text('avatar_url'),
		lastLoginAt: timestamp('last_login_at'),
		mythicRating: integer('mythic_rating'),
		mythicRatingColor: text('mythic_rating_color'),
		raidProgress: jsonb('raid_progress').$type<Record<string, unknown>>(),
		pvpSummary: jsonb('pvp_summary').$type<Record<string, unknown>>(),
		weeklyVault: jsonb('weekly_vault').$type<Record<string, unknown>>(),
		conquest: jsonb('conquest').$type<Record<string, unknown>>(),
		snapshotAt: timestamp('snapshot_at').notNull(),
		payload: jsonb('payload').$type<Record<string, unknown>>(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index('wow_character_dashboard_snapshot_idx').on(table.snapshotAt),
	],
)

export const wowUserCharacterPreferences = pgTable(
	'wow_user_character_preferences',
	{
		id: text('id').primaryKey(),
		userId: text('user_id').notNull(),
		characterId: text('character_id')
			.notNull()
			.references(() => wowCharacters.id, { onDelete: 'cascade' }),
		isFavorite: boolean('is_favorite').notNull().default(false),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex('wow_user_character_preferences_uidx').on(
			table.userId,
			table.characterId,
		),
		index('wow_user_character_preferences_user_idx').on(table.userId),
	],
)
