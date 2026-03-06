import {
	index,
	integer,
	jsonb,
	boolean,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from 'drizzle-orm/pg-core'

export const wowCacheConnectedRealms = pgTable(
	'wow_cache_connected_realms',
	{
		region: text('region').notNull(),
		battlenetId: integer('battlenet_id').notNull(),
		statusType: text('status_type'),
		populationType: text('population_type'),
		payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
		lastSeenAt: timestamp('last_seen_at').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex('wow_cache_connected_realms_uidx').on(
			table.region,
			table.battlenetId,
		),
		index('wow_cache_connected_realms_region_idx').on(table.region),
	],
)

export const wowCacheRealms = pgTable(
	'wow_cache_realms',
	{
		region: text('region').notNull(),
		battlenetId: integer('battlenet_id').notNull(),
		connectedRealmId: integer('connected_realm_id'),
		slug: text('slug').notNull(),
		name: text('name').notNull(),
		category: text('category'),
		locale: text('locale'),
		timezone: text('timezone'),
		realmType: text('realm_type'),
		isTournament: boolean('is_tournament'),
		payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
		lastSeenAt: timestamp('last_seen_at').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex('wow_cache_realms_uidx').on(
			table.region,
			table.battlenetId,
		),
		index('wow_cache_realms_slug_idx').on(table.region, table.slug),
		index('wow_cache_realms_connected_realm_idx').on(
			table.region,
			table.connectedRealmId,
		),
	],
)

export const wowCachePlayableClasses = pgTable(
	'wow_cache_playable_classes',
	{
		region: text('region').notNull(),
		battlenetId: integer('battlenet_id').notNull(),
		name: text('name').notNull(),
		payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
		lastSeenAt: timestamp('last_seen_at').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex('wow_cache_playable_classes_uidx').on(
			table.region,
			table.battlenetId,
		),
	],
)

export const wowCachePlayableRaces = pgTable(
	'wow_cache_playable_races',
	{
		region: text('region').notNull(),
		battlenetId: integer('battlenet_id').notNull(),
		name: text('name').notNull(),
		payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
		lastSeenAt: timestamp('last_seen_at').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex('wow_cache_playable_races_uidx').on(
			table.region,
			table.battlenetId,
		),
	],
)

export const wowCachePlayableSpecializations = pgTable(
	'wow_cache_playable_specializations',
	{
		region: text('region').notNull(),
		battlenetId: integer('battlenet_id').notNull(),
		specializationType: text('specialization_type').notNull(),
		name: text('name').notNull(),
		payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
		lastSeenAt: timestamp('last_seen_at').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex('wow_cache_playable_specs_uidx').on(
			table.region,
			table.battlenetId,
			table.specializationType,
		),
	],
)

export const wowCacheProfessions = pgTable(
	'wow_cache_professions',
	{
		region: text('region').notNull(),
		battlenetId: integer('battlenet_id').notNull(),
		name: text('name').notNull(),
		payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
		lastSeenAt: timestamp('last_seen_at').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex('wow_cache_professions_uidx').on(
			table.region,
			table.battlenetId,
		),
	],
)
