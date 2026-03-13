import {
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from 'drizzle-orm/pg-core'

export const syncRunModeEnum = pgEnum('sync_run_mode', [
	'weekly',
	'full',
	'incremental',
	'manual',
])

export const syncRunStatusEnum = pgEnum('sync_run_status', [
	'running',
	'success',
	'failed',
	'skipped',
])

export const syncRunTriggerEnum = pgEnum('sync_run_trigger', [
	'scheduler',
	'manual',
	'recovery',
	'system',
])

export const syncRuns = pgTable(
	'sync_runs',
	{
		id: text('id').primaryKey(),
		provider: text('provider').notNull(),
		domain: text('domain').notNull(),
		entity: text('entity').notNull(),
		region: text('region').notNull().default('global'),
		scopeKey: text('scope_key').notNull().default('global'),
		mode: syncRunModeEnum('mode').notNull(),
		status: syncRunStatusEnum('status').notNull(),
		triggeredBy: syncRunTriggerEnum('triggered_by').notNull(),
		jobName: text('job_name'),
		jobId: text('job_id'),
		scheduledFor: timestamp('scheduled_for'),
		startedAt: timestamp('started_at').notNull(),
		finishedAt: timestamp('finished_at'),
		insertedCount: integer('inserted_count').notNull().default(0),
		updatedCount: integer('updated_count').notNull().default(0),
		skippedCount: integer('skipped_count').notNull().default(0),
		failedCount: integer('failed_count').notNull().default(0),
		errorMessage: text('error_message'),
		errorPayload: jsonb('error_payload').$type<Record<string, unknown>>(),
		metadata: jsonb('metadata').$type<Record<string, unknown>>(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index('sync_runs_lookup_idx').on(
			table.provider,
			table.domain,
			table.entity,
			table.region,
			table.scopeKey,
			table.startedAt,
		),
		index('sync_runs_status_idx').on(table.status, table.startedAt),
		index('sync_runs_job_id_idx').on(table.jobId),
	],
)

export const syncState = pgTable(
	'sync_state',
	{
		provider: text('provider').notNull(),
		domain: text('domain').notNull(),
		entity: text('entity').notNull(),
		region: text('region').notNull().default('global'),
		scopeKey: text('scope_key').notNull().default('global'),
		lastRunId: text('last_run_id'),
		lastStatus: syncRunStatusEnum('last_status'),
		lastStartedAt: timestamp('last_started_at'),
		lastFinishedAt: timestamp('last_finished_at'),
		lastSuccessAt: timestamp('last_success_at'),
		lastResetKey: text('last_reset_key'),
		cursor: jsonb('cursor').$type<Record<string, unknown>>(),
		metadata: jsonb('metadata').$type<Record<string, unknown>>(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex('sync_state_scope_uidx').on(
			table.provider,
			table.domain,
			table.entity,
			table.region,
			table.scopeKey,
		),
		index('sync_state_last_success_idx').on(table.lastSuccessAt),
	],
)

export const battlenetRespSink = pgTable(
	'battlenet_resp_sink',
	{
		id: text('id').primaryKey(),
		data: jsonb('data').$type<unknown>().notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => [index('battlenet_resp_sink_created_idx').on(table.createdAt)],
)
