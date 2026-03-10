import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@auxarmory/db/client'
import { syncRuns, syncState } from '@auxarmory/db/schema'

export const syncRunTriggerSchema = z.enum([
	'scheduler',
	'manual',
	'recovery',
	'system',
])

export type SyncRunTrigger = z.infer<typeof syncRunTriggerSchema>

export interface SyncRunScope {
	provider: string
	domain: string
	entity: string
	region?: string
	scopeKey?: string
}

export interface StartSyncRunInput extends SyncRunScope {
	mode: 'weekly' | 'full' | 'incremental' | 'manual'
	triggeredBy: SyncRunTrigger
	jobName?: string
	jobId?: string
	scheduledFor?: Date
	metadata?: Record<string, unknown>
}

export interface CompleteSyncRunInput extends SyncRunScope {
	runId: string
	resetKey?: string
	insertedCount?: number
	updatedCount?: number
	skippedCount?: number
	failedCount?: number
	cursor?: Record<string, unknown>
	metadata?: Record<string, unknown>
	errorMessage?: string
	errorPayload?: Record<string, unknown>
}

function scopeRegion(region?: string) {
	return region ?? 'global'
}

function normalizeScopeKey(scopeKey?: string) {
	return scopeKey ?? 'global'
}

export async function startSyncRun(input: StartSyncRunInput) {
	const runId = crypto.randomUUID()
	const startedAt = new Date()
	const region = scopeRegion(input.region)
	const scopeKey = normalizeScopeKey(input.scopeKey)

	await db.insert(syncRuns).values({
		id: runId,
		provider: input.provider,
		domain: input.domain,
		entity: input.entity,
		region,
		scopeKey,
		mode: input.mode,
		status: 'running',
		triggeredBy: input.triggeredBy,
		jobName: input.jobName,
		jobId: input.jobId,
		scheduledFor: input.scheduledFor,
		startedAt,
		metadata: input.metadata,
	})

	await db
		.insert(syncState)
		.values({
			provider: input.provider,
			domain: input.domain,
			entity: input.entity,
			region,
			scopeKey,
			lastRunId: runId,
			lastStatus: 'running',
			lastStartedAt: startedAt,
		})
		.onConflictDoUpdate({
			target: [
				syncState.provider,
				syncState.domain,
				syncState.entity,
				syncState.region,
				syncState.scopeKey,
			],
			set: {
				lastRunId: runId,
				lastStatus: 'running',
				lastStartedAt: startedAt,
				updatedAt: startedAt,
			},
		})

	return {
		runId,
		startedAt,
	}
}

export async function completeSyncRunSuccess(input: CompleteSyncRunInput) {
	const finishedAt = new Date()
	const region = scopeRegion(input.region)
	const scopeKey = normalizeScopeKey(input.scopeKey)

	await db
		.update(syncRuns)
		.set({
			status: 'success',
			finishedAt,
			insertedCount: input.insertedCount ?? 0,
			updatedCount: input.updatedCount ?? 0,
			skippedCount: input.skippedCount ?? 0,
			failedCount: input.failedCount ?? 0,
			metadata: input.metadata,
			updatedAt: finishedAt,
		})
		.where(eq(syncRuns.id, input.runId))

	await db
		.insert(syncState)
		.values({
			provider: input.provider,
			domain: input.domain,
			entity: input.entity,
			region,
			scopeKey,
			lastRunId: input.runId,
			lastStatus: 'success',
			lastFinishedAt: finishedAt,
			lastSuccessAt: finishedAt,
			lastResetKey: input.resetKey,
			cursor: input.cursor,
			metadata: input.metadata,
		})
		.onConflictDoUpdate({
			target: [
				syncState.provider,
				syncState.domain,
				syncState.entity,
				syncState.region,
				syncState.scopeKey,
			],
			set: {
				lastRunId: input.runId,
				lastStatus: 'success',
				lastFinishedAt: finishedAt,
				lastSuccessAt: finishedAt,
				lastResetKey: input.resetKey,
				cursor: input.cursor,
				metadata: input.metadata,
				updatedAt: finishedAt,
			},
		})
}

export async function completeSyncRunFailure(input: CompleteSyncRunInput) {
	const finishedAt = new Date()
	const region = scopeRegion(input.region)
	const scopeKey = normalizeScopeKey(input.scopeKey)

	await db
		.update(syncRuns)
		.set({
			status: 'failed',
			finishedAt,
			insertedCount: input.insertedCount ?? 0,
			updatedCount: input.updatedCount ?? 0,
			skippedCount: input.skippedCount ?? 0,
			failedCount: input.failedCount ?? 1,
			errorMessage: input.errorMessage,
			errorPayload: input.errorPayload,
			metadata: input.metadata,
			updatedAt: finishedAt,
		})
		.where(eq(syncRuns.id, input.runId))

	await db
		.insert(syncState)
		.values({
			provider: input.provider,
			domain: input.domain,
			entity: input.entity,
			region,
			scopeKey,
			lastRunId: input.runId,
			lastStatus: 'failed',
			lastFinishedAt: finishedAt,
			metadata: input.metadata,
		})
		.onConflictDoUpdate({
			target: [
				syncState.provider,
				syncState.domain,
				syncState.entity,
				syncState.region,
				syncState.scopeKey,
			],
			set: {
				lastRunId: input.runId,
				lastStatus: 'failed',
				lastFinishedAt: finishedAt,
				metadata: input.metadata,
				updatedAt: finishedAt,
			},
		})
}

export async function getSyncStateByScope(scope: SyncRunScope) {
	const region = scopeRegion(scope.region)
	const scopeKey = normalizeScopeKey(scope.scopeKey)

	const [state] = await db
		.select()
		.from(syncState)
		.where(
			and(
				eq(syncState.provider, scope.provider),
				eq(syncState.domain, scope.domain),
				eq(syncState.entity, scope.entity),
				eq(syncState.region, region),
				eq(syncState.scopeKey, scopeKey),
			),
		)
		.limit(1)

	return state ?? null
}

export function toErrorPayload(error: unknown): Record<string, unknown> {
	if (error instanceof Error) {
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
		}
	}

	return {
		message: String(error),
	}
}
