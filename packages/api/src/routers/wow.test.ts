import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'

import { and, eq, inArray } from 'drizzle-orm'

const mocks = vi.hoisted(() => ({
	queue: {
		close: vi.fn().mockResolvedValue(undefined),
	},
	createQueue: vi.fn(),
	getJobStateById: vi.fn(),
	isPendingJobState: vi.fn(),
	enqueueUniqueJob: vi.fn(),
}))

let wowRouter: typeof import('./wow').wowRouter
let db: typeof import('@auxarmory/db/client').db
let schema: typeof import('@auxarmory/db/schema')

const testDatabaseUrl =
	process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL

if (!testDatabaseUrl) {
	throw new Error(
		'DATABASE_URL (or DATABASE_URL_TEST) is required for @auxarmory/api tests.',
	)
}

process.env.DATABASE_URL = testDatabaseUrl

const now = new Date('2026-01-10T12:00:00.000Z')
const userId = `wow-sync-user-${Date.now()}`
const authAccountId = `wow-sync-account-${Date.now()}`
const profileAccountId = `wow-sync-profile-${Date.now()}`
const activeCharacterId = `us:wow-sync-active-${Date.now()}`
const inactiveCharacterId = `us:wow-sync-inactive-${Date.now()}`
const failedRunId = `wow-sync-failed-run-${Date.now()}`

async function cleanupTestData() {
	if (!db || !schema) {
		return
	}

	await db
		.delete(schema.syncState)
		.where(
			and(
				eq(schema.syncState.provider, 'battlenet'),
				eq(schema.syncState.domain, 'wow-user'),
				inArray(schema.syncState.scopeKey, [
					userId,
					authAccountId,
					activeCharacterId,
					inactiveCharacterId,
				]),
			),
		)

	await db.delete(schema.syncRuns).where(eq(schema.syncRuns.id, failedRunId))

	await db
		.delete(schema.wowProfileAccountCharacters)
		.where(
			inArray(schema.wowProfileAccountCharacters.id, [
				`${profileAccountId}:${activeCharacterId}`,
				`${profileAccountId}:${inactiveCharacterId}`,
			]),
		)

	await db
		.delete(schema.wowCharacters)
		.where(
			inArray(schema.wowCharacters.id, [
				activeCharacterId,
				inactiveCharacterId,
			]),
		)

	await db
		.delete(schema.wowProfileAccounts)
		.where(eq(schema.wowProfileAccounts.id, profileAccountId))

	await db.delete(schema.account).where(eq(schema.account.id, authAccountId))
	await db.delete(schema.user).where(eq(schema.user.id, userId))
}

vi.mock('@auxarmory/worker/producer', () => ({
	createQueue: mocks.createQueue,
	enqueueUniqueJob: mocks.enqueueUniqueJob,
	getJobStateById: mocks.getJobStateById,
	isPendingJobState: mocks.isPendingJobState,
}))

describe('wowRouter.syncStatus', () => {
	beforeAll(async () => {
		vi.resetModules()
		mocks.createQueue.mockReturnValue(mocks.queue)
		mocks.getJobStateById.mockResolvedValue(null)
		mocks.isPendingJobState.mockReturnValue(false)

		;({ db } = await import('@auxarmory/db/client'))
		schema = await import('@auxarmory/db/schema')
		;({ wowRouter } = await import('./wow'))
	})

	afterAll(async () => {
		await cleanupTestData()
	})

	beforeEach(async () => {
		await cleanupTestData()
		mocks.queue.close.mockClear()
		mocks.createQueue.mockClear()
		mocks.getJobStateById.mockClear()
		mocks.isPendingJobState.mockClear()
		mocks.enqueueUniqueJob.mockClear()
		mocks.createQueue.mockReturnValue(mocks.queue)
		mocks.getJobStateById.mockResolvedValue(null)
		mocks.isPendingJobState.mockReturnValue(false)
	})

	it('ignores inactive character links when aggregating failures', async () => {
		await db.insert(schema.user).values({
			id: userId,
			name: 'Wow Sync Test User',
			email: `wow-sync-${Date.now()}@example.com`,
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		})

		await db.insert(schema.account).values({
			id: authAccountId,
			accountId: '123456',
			providerId: 'battlenet-us',
			userId,
			createdAt: now,
			updatedAt: now,
		})

		await db.insert(schema.wowProfileAccounts).values({
			id: profileAccountId,
			authAccountId,
			userId,
			providerId: 'battlenet-us',
			region: 'us',
			status: 'active',
			lastDiscoveredAt: now,
			createdAt: now,
			updatedAt: now,
		})

		await db.insert(schema.wowCharacters).values([
			{
				id: activeCharacterId,
				region: 'us',
				battlenetCharacterId: 101,
				realmId: 1,
				realmSlug: 'stormrage',
				name: 'Activechar',
				level: 80,
				lastSeenAt: now,
				createdAt: now,
				updatedAt: now,
			},
			{
				id: inactiveCharacterId,
				region: 'us',
				battlenetCharacterId: 202,
				realmId: 1,
				realmSlug: 'stormrage',
				name: 'Inactivechar',
				level: 80,
				lastSeenAt: now,
				createdAt: now,
				updatedAt: now,
			},
		])

		await db.insert(schema.wowProfileAccountCharacters).values([
			{
				id: `${profileAccountId}:${activeCharacterId}`,
				wowProfileAccountId: profileAccountId,
				characterId: activeCharacterId,
				wowAccountId: 1,
				isActive: true,
				firstSeenAt: now,
				lastSeenAt: now,
				lastOwnershipSyncAt: now,
				createdAt: now,
				updatedAt: now,
			},
			{
				id: `${profileAccountId}:${inactiveCharacterId}`,
				wowProfileAccountId: profileAccountId,
				characterId: inactiveCharacterId,
				wowAccountId: 1,
				isActive: false,
				firstSeenAt: now,
				lastSeenAt: now,
				lastOwnershipSyncAt: now,
				createdAt: now,
				updatedAt: now,
			},
		])

		await db.insert(schema.syncState).values([
			{
				provider: 'battlenet',
				domain: 'wow-user',
				entity: 'profile-account',
				region: 'global',
				scopeKey: authAccountId,
				lastRunId: `${authAccountId}-success`,
				lastStatus: 'success',
				lastStartedAt: new Date('2026-01-10T10:00:00.000Z'),
				lastFinishedAt: new Date('2026-01-10T10:05:00.000Z'),
				lastSuccessAt: new Date('2026-01-10T10:05:00.000Z'),
				createdAt: now,
				updatedAt: now,
			},
			{
				provider: 'battlenet',
				domain: 'wow-user',
				entity: 'profile-character',
				region: 'global',
				scopeKey: activeCharacterId,
				lastRunId: `${activeCharacterId}-success`,
				lastStatus: 'success',
				lastStartedAt: new Date('2026-01-10T11:00:00.000Z'),
				lastFinishedAt: new Date('2026-01-10T11:05:00.000Z'),
				lastSuccessAt: new Date('2026-01-10T11:05:00.000Z'),
				createdAt: now,
				updatedAt: now,
			},
			{
				provider: 'battlenet',
				domain: 'wow-user',
				entity: 'profile-character',
				region: 'global',
				scopeKey: inactiveCharacterId,
				lastRunId: failedRunId,
				lastStatus: 'failed',
				lastStartedAt: new Date('2026-01-09T10:00:00.000Z'),
				lastFinishedAt: new Date('2026-01-09T10:05:00.000Z'),
				lastSuccessAt: null,
				createdAt: now,
				updatedAt: now,
			},
		])

		await db.insert(schema.syncRuns).values({
			id: failedRunId,
			provider: 'battlenet',
			domain: 'wow-user',
			entity: 'profile-character',
			region: 'global',
			scopeKey: inactiveCharacterId,
			mode: 'incremental',
			status: 'failed',
			triggeredBy: 'manual',
			startedAt: new Date('2026-01-09T10:00:00.000Z'),
			finishedAt: new Date('2026-01-09T10:05:00.000Z'),
			errorMessage: 'Inactive character failed previously',
			createdAt: now,
			updatedAt: now,
		})

		const caller = wowRouter.createCaller({
			headers: new Headers(),
			session: {
				user: {
					id: userId,
					email: 'wow-sync-test@example.com',
				},
			},
		} as unknown as Parameters<typeof wowRouter.createCaller>[0])

		await expect(caller.syncStatus()).resolves.toMatchObject({
			status: 'ready',
			lastErrorMessage: null,
			linkedBattlenetAccountCount: 1,
		})

		expect(mocks.queue.close).toHaveBeenCalledTimes(1)
	})
})
