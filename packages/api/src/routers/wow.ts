import { and, eq, inArray, like } from 'drizzle-orm'

import { db } from '@auxarmory/db/client'
import {
	account,
	syncRuns,
	syncState,
	wowCharacterSnapshots,
	wowCharacters,
	wowGuilds,
	wowProfileAccountCharacters,
	wowProfileAccounts,
	wowUserCharacterPreferences,
} from '@auxarmory/db/schema'
import {
	createQueue,
	enqueueUniqueJob,
	getJobStateById,
	isPendingJobState,
} from '@auxarmory/worker/producer'

import { protectedProcedure, router } from '../index.js'

const WOW_PROVIDER_PREFIX = 'battlenet-'
const WOW_SYNC_PROVIDER = 'battlenet'
const WOW_SYNC_DOMAIN = 'wow-user'
const WOW_PROFILE_ACCOUNT_COORDINATOR_ENTITY = 'profile-account-coordinator'
const WOW_PROFILE_ACCOUNT_ENTITY = 'profile-account'
const WOW_PROFILE_CHARACTER_ENTITY = 'profile-character'

type WowSyncStatus =
	| 'not_linked'
	| 'never_synced'
	| 'queued'
	| 'running'
	| 'ready'
	| 'failed'
	| 'partial_failure'

function toIsoString(value: Date | null | undefined) {
	return value ? value.toISOString() : null
}

function formatWowProfileCoordinatorJobId(userId: string) {
	return `wow-profile-coordinator-${userId}`
}

function formatWowProfileAccountJobId(authAccountId: string) {
	return `wow-profile-account-${authAccountId}`
}

function formatWowProfileCharacterJobId(region: string, characterId: string) {
	return `wow-profile-character-${region.toLowerCase()}-${characterId}`
}

function getLatestDate(values: (Date | null | undefined)[]) {
	return (
		values
			.filter((value): value is Date => value instanceof Date)
			.sort((left, right) => right.getTime() - left.getTime())[0] ?? null
	)
}

function extractRaidProgress(
	raidProgress: Record<string, unknown> | null | undefined,
) {
	if (!Array.isArray(raidProgress) || raidProgress.length === 0) {
		return null
	}

	const [instance] = raidProgress as {
		instanceName?: string
		modes?: {
			difficulty?: string
			completedCount?: number
			totalCount?: number
		}[]
	}[]

	if (!instance) {
		return null
	}

	const progress = {
		instanceName:
			typeof instance.instanceName === 'string'
				? instance.instanceName
				: null,
		normal: null as string | null,
		heroic: null as string | null,
		mythic: null as string | null,
	}

	for (const mode of instance.modes ?? []) {
		if (
			typeof mode.completedCount !== 'number' ||
			typeof mode.totalCount !== 'number'
		) {
			continue
		}

		const value = `${mode.completedCount}/${mode.totalCount}`

		if (mode.difficulty === 'NORMAL') {
			progress.normal = value
		}

		if (mode.difficulty === 'HEROIC') {
			progress.heroic = value
		}

		if (mode.difficulty === 'MYTHIC') {
			progress.mythic = value
		}
	}

	return progress
}

function extractWeeklyVault(value: Record<string, unknown> | null | undefined) {
	if (!value) {
		return null
	}

	return {
		raid: typeof value.raid === 'number' ? value.raid : 0,
		mythicPlus: typeof value.mythicPlus === 'number' ? value.mythicPlus : 0,
		pvp: typeof value.pvp === 'number' ? value.pvp : 0,
	}
}

function extractConquest(value: Record<string, unknown> | null | undefined) {
	if (!value) {
		return null
	}

	return {
		current: typeof value.current === 'number' ? value.current : 0,
		max: typeof value.max === 'number' ? value.max : 0,
	}
}

async function getLinkedBattlenetAccounts(userId: string) {
	return db
		.select({
			id: account.id,
			providerId: account.providerId,
			accountId: account.accountId,
		})
		.from(account)
		.where(
			and(
				eq(account.userId, userId),
				like(account.providerId, `${WOW_PROVIDER_PREFIX}%`),
			),
		)
}

async function getWowSyncRunState(userId: string) {
	const linkedAccounts = await getLinkedBattlenetAccounts(userId)

	if (linkedAccounts.length === 0) {
		return {
			linkedAccounts,
			profileAccountIds: [],
			coordinatorState: null,
			isRunning: false,
			isQueued: false,
			relevantStates: [],
			lastErrorMessage: null,
		}
	}

	const profileAccounts = await db
		.select({
			id: wowProfileAccounts.id,
		})
		.from(wowProfileAccounts)
		.where(eq(wowProfileAccounts.userId, userId))

	const [coordinatorState] = await db
		.select()
		.from(syncState)
		.where(
			and(
				eq(syncState.provider, WOW_SYNC_PROVIDER),
				eq(syncState.domain, WOW_SYNC_DOMAIN),
				eq(syncState.entity, WOW_PROFILE_ACCOUNT_COORDINATOR_ENTITY),
				eq(syncState.scopeKey, userId),
			),
		)
		.limit(1)

	const characterIds = profileAccounts.length
		? (
				await db
					.select({
						characterId: wowProfileAccountCharacters.characterId,
					})
					.from(wowProfileAccountCharacters)
					.where(
						inArray(
							wowProfileAccountCharacters.wowProfileAccountId,
							profileAccounts.map(
								(profileAccount) => profileAccount.id,
							),
						),
					)
			).map((row) => row.characterId)
		: []

	const runningScopeKeys = [
		userId,
		...linkedAccounts.map((linkedAccount) => linkedAccount.id),
		...characterIds,
	]

	const [accountStates, characterStates, runningRuns] = await Promise.all([
		linkedAccounts.length
			? db
					.select({
						lastRunId: syncState.lastRunId,
						lastStatus: syncState.lastStatus,
						lastStartedAt: syncState.lastStartedAt,
						lastFinishedAt: syncState.lastFinishedAt,
						lastSuccessAt: syncState.lastSuccessAt,
					})
					.from(syncState)
					.where(
						and(
							eq(syncState.provider, WOW_SYNC_PROVIDER),
							eq(syncState.domain, WOW_SYNC_DOMAIN),
							eq(syncState.entity, WOW_PROFILE_ACCOUNT_ENTITY),
							inArray(
								syncState.scopeKey,
								linkedAccounts.map(
									(linkedAccount) => linkedAccount.id,
								),
							),
						),
					)
			: [],
		characterIds.length
			? db
					.select({
						lastRunId: syncState.lastRunId,
						lastStatus: syncState.lastStatus,
						lastStartedAt: syncState.lastStartedAt,
						lastFinishedAt: syncState.lastFinishedAt,
						lastSuccessAt: syncState.lastSuccessAt,
					})
					.from(syncState)
					.where(
						and(
							eq(syncState.provider, WOW_SYNC_PROVIDER),
							eq(syncState.domain, WOW_SYNC_DOMAIN),
							eq(syncState.entity, WOW_PROFILE_CHARACTER_ENTITY),
							inArray(syncState.scopeKey, characterIds),
						),
					)
			: [],
		runningScopeKeys.length
			? db
					.select({ id: syncRuns.id })
					.from(syncRuns)
					.where(
						and(
							eq(syncRuns.provider, WOW_SYNC_PROVIDER),
							eq(syncRuns.domain, WOW_SYNC_DOMAIN),
							inArray(syncRuns.entity, [
								WOW_PROFILE_ACCOUNT_COORDINATOR_ENTITY,
								WOW_PROFILE_ACCOUNT_ENTITY,
								WOW_PROFILE_CHARACTER_ENTITY,
							]),
							inArray(syncRuns.scopeKey, runningScopeKeys),
							eq(syncRuns.status, 'running'),
						),
					)
					.limit(1)
			: [],
	])

	const queue = createQueue()

	try {
		const queuedJobStates = await Promise.all([
			getJobStateById(queue, formatWowProfileCoordinatorJobId(userId)),
			...linkedAccounts.map((linkedAccount) =>
				getJobStateById(
					queue,
					formatWowProfileAccountJobId(linkedAccount.id),
				),
			),
			...characterIds.map((characterId) => {
				const separatorIndex = characterId.indexOf(':')
				const region =
					separatorIndex >= 0
						? characterId.slice(0, separatorIndex)
						: ''
				const battlenetCharacterId =
					separatorIndex >= 0
						? characterId.slice(separatorIndex + 1)
						: characterId

				return getJobStateById(
					queue,
					formatWowProfileCharacterJobId(
						region,
						battlenetCharacterId,
					),
				)
			}),
		])

		const hasActiveJob = queuedJobStates.includes('active')
		const isQueued = queuedJobStates.some(
			(state) =>
				state !== 'active' && !!state && isPendingJobState(state),
		)
		const relevantStates = [...accountStates, ...characterStates]
		const failedRunIds = [coordinatorState, ...relevantStates]
			.map((state) =>
				state?.lastStatus === 'failed' ? state.lastRunId : null,
			)
			.filter((runId): runId is string => typeof runId === 'string')

		const failedRuns = failedRunIds.length
			? await db
					.select({
						errorMessage: syncRuns.errorMessage,
						finishedAt: syncRuns.finishedAt,
						startedAt: syncRuns.startedAt,
					})
					.from(syncRuns)
					.where(inArray(syncRuns.id, failedRunIds))
			: []

		const latestFailedRun = failedRuns.sort((left, right) => {
			const leftTime = (left.finishedAt ?? left.startedAt).getTime()
			const rightTime = (right.finishedAt ?? right.startedAt).getTime()

			return rightTime - leftTime
		})[0]

		return {
			linkedAccounts,
			profileAccountIds: profileAccounts.map(
				(profileAccount) => profileAccount.id,
			),
			coordinatorState: coordinatorState ?? null,
			isRunning: runningRuns.length > 0 || hasActiveJob,
			isQueued,
			relevantStates,
			lastErrorMessage: latestFailedRun?.errorMessage ?? null,
		}
	} finally {
		await queue.close()
	}
}

async function getWowSyncStatus(userId: string) {
	const {
		linkedAccounts,
		coordinatorState,
		isRunning,
		isQueued,
		relevantStates,
		lastErrorMessage,
	} = await getWowSyncRunState(userId)

	if (linkedAccounts.length === 0) {
		return {
			status: 'not_linked' as WowSyncStatus,
			linkedBattlenetAccountCount: 0,
			lastStartedAt: null,
			lastFinishedAt: null,
			lastSuccessAt: null,
			lastErrorMessage: null,
		}
	}

	if (isRunning) {
		return {
			status: 'running' as WowSyncStatus,
			linkedBattlenetAccountCount: linkedAccounts.length,
			lastStartedAt: toIsoString(
				getLatestDate([
					coordinatorState?.lastStartedAt,
					...relevantStates.map((state) => state.lastStartedAt),
				]),
			),
			lastFinishedAt: toIsoString(
				getLatestDate([
					coordinatorState?.lastFinishedAt,
					...relevantStates.map((state) => state.lastFinishedAt),
				]),
			),
			lastSuccessAt: toIsoString(
				getLatestDate(
					relevantStates.map((state) => state.lastSuccessAt),
				),
			),
			lastErrorMessage,
		}
	}

	if (isQueued) {
		return {
			status: 'queued' as WowSyncStatus,
			linkedBattlenetAccountCount: linkedAccounts.length,
			lastStartedAt: toIsoString(
				getLatestDate([
					coordinatorState?.lastStartedAt,
					...relevantStates.map((state) => state.lastStartedAt),
				]),
			),
			lastFinishedAt: toIsoString(
				getLatestDate([
					coordinatorState?.lastFinishedAt,
					...relevantStates.map((state) => state.lastFinishedAt),
				]),
			),
			lastSuccessAt: toIsoString(
				getLatestDate(
					relevantStates.map((state) => state.lastSuccessAt),
				),
			),
			lastErrorMessage,
		}
	}

	const lastStartedAt = getLatestDate([
		coordinatorState?.lastStartedAt,
		...relevantStates.map((state) => state.lastStartedAt),
	])
	const lastFinishedAt = getLatestDate([
		coordinatorState?.lastFinishedAt,
		...relevantStates.map((state) => state.lastFinishedAt),
	])
	const lastSuccessAt = getLatestDate(
		relevantStates.map((state) => state.lastSuccessAt),
	)
	const failedCount = [coordinatorState, ...relevantStates].filter(
		(state) => state?.lastStatus === 'failed',
	).length

	let status: WowSyncStatus = 'never_synced'

	if (lastSuccessAt) {
		status = failedCount > 0 ? 'partial_failure' : 'ready'
	} else if (failedCount > 0) {
		status = 'failed'
	}

	return {
		status,
		linkedBattlenetAccountCount: linkedAccounts.length,
		lastStartedAt: toIsoString(lastStartedAt),
		lastFinishedAt: toIsoString(lastFinishedAt),
		lastSuccessAt: toIsoString(lastSuccessAt),
		lastErrorMessage,
	}
}

export const wowRouter = router({
	syncStatus: protectedProcedure.query(async ({ ctx }) => {
		return getWowSyncStatus(ctx.session.user.id)
	}),
	dashboard: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id
		const sync = await getWowSyncStatus(userId)

		const profileAccounts = await db
			.select({ id: wowProfileAccounts.id })
			.from(wowProfileAccounts)
			.where(eq(wowProfileAccounts.userId, userId))

		if (profileAccounts.length === 0) {
			return {
				sync,
				characters: [],
			}
		}

		const activeLinks = await db
			.select({
				characterId: wowProfileAccountCharacters.characterId,
			})
			.from(wowProfileAccountCharacters)
			.where(
				and(
					inArray(
						wowProfileAccountCharacters.wowProfileAccountId,
						profileAccounts.map(
							(profileAccount) => profileAccount.id,
						),
					),
					eq(wowProfileAccountCharacters.isActive, true),
				),
			)

		const characterIds = Array.from(
			new Set(activeLinks.map((link) => link.characterId)),
		)

		if (characterIds.length === 0) {
			return {
				sync,
				characters: [],
			}
		}

		const [characters, snapshots, preferences] = await Promise.all([
			db
				.select()
				.from(wowCharacters)
				.where(inArray(wowCharacters.id, characterIds)),
			db
				.select()
				.from(wowCharacterSnapshots)
				.where(
					inArray(wowCharacterSnapshots.characterId, characterIds),
				),
			db
				.select()
				.from(wowUserCharacterPreferences)
				.where(
					and(
						eq(wowUserCharacterPreferences.userId, userId),
						inArray(
							wowUserCharacterPreferences.characterId,
							characterIds,
						),
					),
				),
		])

		const guildIds = Array.from(
			new Set(
				characters
					.map((character) => character.guildId)
					.filter(
						(value): value is string => typeof value === 'string',
					),
			),
		)

		const guilds = guildIds.length
			? await db
					.select()
					.from(wowGuilds)
					.where(inArray(wowGuilds.id, guildIds))
			: []

		const snapshotByCharacterId = new Map(
			snapshots.map((snapshot) => [snapshot.characterId, snapshot]),
		)
		const preferenceByCharacterId = new Map(
			preferences.map((preference) => [
				preference.characterId,
				preference,
			]),
		)
		const guildById = new Map(guilds.map((guild) => [guild.id, guild]))

		const dashboardCharacters = characters
			.map((character) => {
				const snapshot = snapshotByCharacterId.get(character.id)
				const preference = preferenceByCharacterId.get(character.id)
				const guild = character.guildId
					? guildById.get(character.guildId)
					: null

				return {
					id: character.id,
					name: character.name,
					level: character.level,
					activeSpec:
						snapshot?.activeSpecName ?? character.activeSpecName,
					className: character.className,
					equippedItemLevel: snapshot?.equippedItemLevel ?? null,
					mythicRating: snapshot?.mythicRating ?? null,
					mythicRatingColor: snapshot?.mythicRatingColor ?? null,
					lastLogin: toIsoString(
						snapshot?.lastLoginAt ?? character.lastLoginAt,
					),
					avatarUrl: snapshot?.avatarUrl ?? character.avatarUrl,
					favorite: preference?.isFavorite ?? false,
					raidProgress: extractRaidProgress(snapshot?.raidProgress),
					mythicScore: snapshot?.mythicRating ?? null,
					pvpRating: null,
					weeklyVault: extractWeeklyVault(snapshot?.weeklyVault),
					conquest: extractConquest(snapshot?.conquest),
					guild: guild
						? {
								name: guild.name,
								realm: guild.realmSlug,
								memberCount: guild.memberCount,
							}
						: null,
					snapshotAt: toIsoString(snapshot?.snapshotAt),
				}
			})
			.sort((left, right) => {
				if (left.favorite !== right.favorite) {
					return left.favorite ? -1 : 1
				}

				const leftLevel = left.level ?? 0
				const rightLevel = right.level ?? 0

				if (leftLevel !== rightLevel) {
					return rightLevel - leftLevel
				}

				const leftTimestamp = left.lastLogin
					? Date.parse(left.lastLogin)
					: 0
				const rightTimestamp = right.lastLogin
					? Date.parse(right.lastLogin)
					: 0

				return rightTimestamp - leftTimestamp
			})

		return {
			sync,
			characters: dashboardCharacters,
		}
	}),
	triggerSync: protectedProcedure.mutation(async ({ ctx }) => {
		const syncState = await getWowSyncRunState(ctx.session.user.id)

		if (syncState.linkedAccounts.length === 0) {
			return {
				status: 'not_linked' as const,
				jobId: null,
				queuedAt: null,
				lastStartedAt: null,
			}
		}

		if (syncState.isRunning) {
			return {
				status: 'already_running' as const,
				jobId: null,
				queuedAt: null,
				lastStartedAt: toIsoString(
					syncState.coordinatorState?.lastStartedAt,
				),
			}
		}

		if (syncState.isQueued) {
			return {
				status: 'already_queued' as const,
				jobId: null,
				queuedAt: null,
				lastStartedAt: toIsoString(
					syncState.coordinatorState?.lastStartedAt,
				),
			}
		}

		const queue = createQueue()

		try {
			const job = await enqueueUniqueJob(queue, {
				name: 'sync:wow:profile:account:coordinator',
				payload: {
					userId: ctx.session.user.id,
					triggeredBy: 'manual',
					force: true,
				},
				jobId: formatWowProfileCoordinatorJobId(ctx.session.user.id),
			})

			return {
				status: job.deduplicated
					? ('already_queued' as const)
					: ('queued' as const),
				jobId: String(job.job.id),
				queuedAt: new Date().toISOString(),
				lastStartedAt: null,
			}
		} finally {
			await queue.close()
		}
	}),
})
