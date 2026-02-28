import { randomUUID } from 'node:crypto'

import { Queue } from 'bullmq'
import { and, eq, like, or } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@auxarmory/db/client'
import {
	account,
	member,
	organization,
	wowGuild,
	wowGuildControl,
	wowGuildControlEvent,
	wowGuildRosterMember,
} from '@auxarmory/db/schema'

import { protectedProcedure, router } from '../index.js'

const CLAIM_FRESHNESS_MS = 15 * 60 * 1000
const SYNC_QUEUE_NAME = 'battlenet-sync'
const SYNC_USER_ACCOUNT_JOB = 'sync:user-account'

let syncQueue: Queue | null = null

const getSyncQueue = () => {
	const redisUrl = process.env.REDIS_URL
	if (!redisUrl) {
		return null
	}

	if (!syncQueue) {
		syncQueue = new Queue(SYNC_QUEUE_NAME, {
			connection: {
				url: redisUrl,
			},
		})
	}

	return syncQueue
}

const claimInput = z.object({
	region: z.enum(['us', 'eu', 'kr', 'tw']),
	realmSlug: z.string().min(1),
	nameSlug: z.string().min(1),
})

const buildSlug = (value: string) => {
	return value
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
}

const resolveOrganizationSlug = async (baseSlug: string) => {
	const normalized = baseSlug || `guild-${Date.now()}`
	const existing = await db
		.select({ slug: organization.slug })
		.from(organization)
		.where(
			or(
				eq(organization.slug, normalized),
				like(organization.slug, `${normalized}-%`),
			),
		)

	if (existing.length === 0) {
		return normalized
	}

	const used = new Set(existing.map((entry: { slug: string }) => entry.slug))
	for (let suffix = 2; suffix < 1_000; suffix += 1) {
		const candidate = `${normalized}-${suffix}`
		if (!used.has(candidate)) {
			return candidate
		}
	}

	return `${normalized}-${Date.now()}`
}

const recordControlEvent = async (params: {
	guildId: string
	actorUserId: string
	eventType: string
	fromState?: string | null
	toState?: string | null
	details?: string
}) => {
	await db.insert(wowGuildControlEvent).values({
		id: randomUUID(),
		guildId: params.guildId,
		actorUserId: params.actorUserId,
		eventType: params.eventType,
		fromState: params.fromState,
		toState: params.toState,
		details: params.details,
	})
}

const claimGuildProcedure = protectedProcedure
	.input(claimInput)
	.mutation(async ({ ctx, input }) => {
		const guild = await db.query.wowGuild.findFirst({
			where: and(
				eq(wowGuild.region, input.region),
				eq(wowGuild.realmSlug, input.realmSlug),
				eq(wowGuild.nameSlug, input.nameSlug),
			),
		})

		if (!guild) {
			throw new Error(
				'Guild is not discovered yet. Please retry after sync.',
			)
		}

		if (
			!guild.lastSyncedAt ||
			Date.now() - guild.lastSyncedAt.getTime() > CLAIM_FRESHNESS_MS
		) {
			throw new Error(
				'Guild roster is stale. Please retry after a sync cycle.',
			)
		}

		const leaderRosterEntry = await db.query.wowGuildRosterMember.findFirst(
			{
				where: and(
					eq(wowGuildRosterMember.guildId, guild.id),
					eq(wowGuildRosterMember.rank, 0),
					eq(wowGuildRosterMember.ownerUserId, ctx.session.user.id),
				),
			},
		)

		if (!leaderRosterEntry) {
			throw new Error(
				'Leader-only claim failed. Link leader character first.',
			)
		}

		const currentControl = await db.query.wowGuildControl.findFirst({
			where: eq(wowGuildControl.guildId, guild.id),
		})

		if (
			currentControl?.state === 'managed' &&
			currentControl.ownerUserId === ctx.session.user.id
		) {
			return {
				ok: true,
				guildId: guild.id,
				organizationId: currentControl.organizationId,
				state: 'managed',
				action: 'noop',
			}
		}

		let organizationId = currentControl?.organizationId ?? null
		if (!organizationId) {
			const slug = await resolveOrganizationSlug(buildSlug(guild.name))
			organizationId = randomUUID()

			await db.insert(organization).values({
				id: organizationId,
				name: guild.name,
				slug,
				createdAt: new Date(),
			})
		}

		const actorMembership = await db.query.member.findFirst({
			where: and(
				eq(member.organizationId, organizationId),
				eq(member.userId, ctx.session.user.id),
			),
		})

		if (actorMembership) {
			if (actorMembership.role !== 'owner') {
				await db
					.update(member)
					.set({ role: 'owner' })
					.where(eq(member.id, actorMembership.id))
			}
		} else {
			await db.insert(member).values({
				id: randomUUID(),
				organizationId,
				userId: ctx.session.user.id,
				role: 'owner',
				createdAt: new Date(),
			})
		}

		if (
			currentControl?.ownerUserId &&
			currentControl.ownerUserId !== ctx.session.user.id
		) {
			const previousOwnerMembership = await db.query.member.findFirst({
				where: and(
					eq(member.organizationId, organizationId),
					eq(member.userId, currentControl.ownerUserId),
				),
			})

			if (previousOwnerMembership) {
				await db
					.update(member)
					.set({ role: 'admin' })
					.where(eq(member.id, previousOwnerMembership.id))
			}
		}

		const nextState = 'managed'
		const now = new Date()

		if (currentControl) {
			await db
				.update(wowGuildControl)
				.set({
					organizationId,
					state: nextState,
					ownerUserId: ctx.session.user.id,
					mismatchSince: null,
					graceEndsAt: null,
					lastLeadershipCheckAt: now,
					lastClaimedAt: now,
					lastTransferredAt:
						currentControl.ownerUserId &&
						currentControl.ownerUserId !== ctx.session.user.id
							? now
							: currentControl.lastTransferredAt,
					updatedAt: now,
				})
				.where(eq(wowGuildControl.guildId, guild.id))
		} else {
			await db.insert(wowGuildControl).values({
				guildId: guild.id,
				organizationId,
				state: nextState,
				ownerUserId: ctx.session.user.id,
				lastLeadershipCheckAt: now,
				lastClaimedAt: now,
			})
		}

		const isTransfer =
			!!currentControl?.ownerUserId &&
			currentControl.ownerUserId !== ctx.session.user.id

		await recordControlEvent({
			guildId: guild.id,
			actorUserId: ctx.session.user.id,
			eventType: isTransfer ? 'transfer' : 'claim',
			fromState: currentControl?.state ?? null,
			toState: nextState,
			details: isTransfer
				? 'Manual transfer after verified leader claim.'
				: 'Leader claimed guild control.',
		})

		return {
			ok: true,
			guildId: guild.id,
			organizationId,
			state: nextState,
			action: isTransfer ? 'transfer' : 'claim',
		}
	})

export const guildRouter = router({
	claim: claimGuildProcedure,
	transferLeadership: claimGuildProcedure,
	triggerOnDemandSync: protectedProcedure.mutation(async ({ ctx }) => {
		const requestedAt = Date.now()
		const battlenetAccounts = await db
			.select({
				id: account.id,
				providerId: account.providerId,
				accountId: account.accountId,
			})
			.from(account)
			.where(
				and(
					eq(account.userId, ctx.session.user.id),
					like(account.providerId, 'battlenet-%'),
				),
			)

		if (battlenetAccounts.length === 0) {
			throw new Error('No linked Battle.net account found for this user.')
		}

		const queue = getSyncQueue()
		if (!queue) {
			throw new Error('Sync queue is not configured on API service.')
		}

		for (const [index, battlenetAccount] of battlenetAccounts.entries()) {
			await queue.add(
				SYNC_USER_ACCOUNT_JOB,
				{
					userId: ctx.session.user.id,
					providerId: battlenetAccount.providerId,
					accountId: battlenetAccount.id,
				},
				{
					jobId: [
						SYNC_USER_ACCOUNT_JOB,
						ctx.session.user.id,
						battlenetAccount.providerId,
						battlenetAccount.accountId,
						String(requestedAt),
						String(index),
					]
						.join('__')
						.toLowerCase()
						.replaceAll(':', '__'),
					priority: 1,
					attempts: 5,
					backoff: {
						type: 'exponential',
						delay: 2_000,
					},
					removeOnComplete: 100,
					removeOnFail: 500,
				},
			)
		}

		return {
			ok: true,
			enqueued: battlenetAccounts.length,
		}
	}),
	myClaims: protectedProcedure.query(async ({ ctx }) => {
		return db
			.select({
				guildId: wowGuildControl.guildId,
				organizationId: wowGuildControl.organizationId,
				state: wowGuildControl.state,
				guildName: wowGuild.name,
				region: wowGuild.region,
				realmSlug: wowGuild.realmSlug,
				nameSlug: wowGuild.nameSlug,
			})
			.from(wowGuildControl)
			.innerJoin(wowGuild, eq(wowGuild.id, wowGuildControl.guildId))
			.where(eq(wowGuildControl.ownerUserId, ctx.session.user.id))
	}),
})
