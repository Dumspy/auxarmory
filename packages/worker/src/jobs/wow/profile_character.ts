import { sql } from 'drizzle-orm'

import { db } from '@auxarmory/db/client'
import {
	wowCharacters,
	wowCharacterSnapshots,
	wowGuilds,
} from '@auxarmory/db/schema'

import { defineJob } from '../../registry.js'
import {
	completeSyncRunFailure,
	completeSyncRunSuccess,
	SYNC_PROVIDER,
	toErrorPayload,
	startSyncRun,
	unwrapBattlenetResponse,
	createJobBattlenetClient,
} from './utils.js'
import {
	WOW_PROFILE_CHARACTER_ENTITY,
	WOW_PROFILE_SYNC_DOMAIN,
	wowProfileCharacterJobPayloadSchema,
} from './profile_utils.js'
import type { WowProfileCharacterJobPayload } from './profile_utils.js'

interface CharacterProfileGuild {
	id: number
	name: string
	realm: {
		id: number
		slug: string
	}
	faction: {
		type: string
	}
}

interface CharacterProfileSummary {
	id: number
	name: string
	realm: {
		id: number
		slug: string
	}
	race: {
		id: number
		name: string
	}
	character_class: {
		id: number
		name: string
	}
	active_spec?: {
		id: number
		name: string
	}
	level: number
	last_login_timestamp: number
	equipped_item_level: number
	average_item_level: number
	guild?: CharacterProfileGuild
}

interface CharacterSpecializationsSummary {
	active_specialization: {
		id: number
		name: string
	}
}

interface CharacterMediaSummary {
	assets: {
		key: string
		value: string
	}[]
}

interface CharacterMythicKeystoneProfile {
	current_mythic_rating?: {
		rating: number
		color: {
			r: number
			g: number
			b: number
			a: number
		}
	}
}

interface CharacterPvpSummary {
	honor_level: number
	honorable_kills: number
}

interface CharacterRaidSummary {
	expansions?: {
		instances: {
			instance: {
				id: number
				name: string
			}
			modes: {
				difficulty: {
					type: string
					name: string
				}
				progress: {
					completed_count: number
					total_count: number
				}
			}[]
		}[]
	}[]
}

function formatWowGuildId(region: string, battlenetGuildId: number) {
	return `${region}:${battlenetGuildId}`
}

function formatColorHex(color?: { r: number; g: number; b: number }) {
	if (!color) {
		return null
	}

	return `#${[color.r, color.g, color.b]
		.map((value) => value.toString(16).padStart(2, '0'))
		.join('')}`
}

function selectAvatarUrl(media: CharacterMediaSummary | null) {
	if (!media) {
		return null
	}

	return (
		media.assets.find((asset) => asset.key === 'avatar')?.value ??
		media.assets.find((asset) => asset.key === 'main-raw')?.value ??
		media.assets[0]?.value ??
		null
	)
}

function summarizeRaidProgress(raid: CharacterRaidSummary | null) {
	if (!raid?.expansions?.length) {
		return null
	}

	return raid.expansions.flatMap((expansion) =>
		expansion.instances.map((instance) => ({
			instanceId: instance.instance.id,
			instanceName: instance.instance.name,
			modes: instance.modes.map((mode) => ({
				difficulty: mode.difficulty.type,
				name: mode.difficulty.name,
				completedCount: mode.progress.completed_count,
				totalCount: mode.progress.total_count,
			})),
		})),
	)
}

async function fetchOptionalProfile<T>(work: () => Promise<T>) {
	try {
		return await work()
	} catch {
		return null
	}
}

export const syncWowProfileCharacterJob = defineJob({
	name: 'sync:wow:profile:character',
	description: 'Sync one character profile snapshot and guild linkage',
	allowManualRun: true,
	schema: wowProfileCharacterJobPayloadSchema,
	data: {
		authAccountId: 'auth-account-id',
		characterId: '12345',
		region: 'us',
		realmSlug: 'stormrage',
		characterName: 'Thrall',
		triggeredBy: 'manual',
		force: false,
	} satisfies WowProfileCharacterJobPayload,
	handler: async function handleSyncWowProfileCharacter(job) {
		const scopeKey = `${job.data.region}:${job.data.characterId}`
		const { runId } = await startSyncRun({
			provider: SYNC_PROVIDER,
			domain: WOW_PROFILE_SYNC_DOMAIN,
			entity: WOW_PROFILE_CHARACTER_ENTITY,
			scopeKey,
			region: job.data.region,
			mode: 'manual',
			triggeredBy: job.data.triggeredBy,
			jobName: job.name,
			jobId: String(job.id ?? ''),
			scheduledFor: job.timestamp ? new Date(job.timestamp) : undefined,
		})

		try {
			const client = createJobBattlenetClient(job, {
				entity: WOW_PROFILE_CHARACTER_ENTITY,
				runId,
			})
			const syncedAt = new Date()

			const profile = (await unwrapBattlenetResponse(
				client.wow.CharacterProfileSummary(
					job.data.realmSlug,
					job.data.characterName,
				),
			)) as CharacterProfileSummary

			const [
				specializations,
				equipment,
				media,
				mythic,
				pvpSummary,
				raid,
			] = await Promise.all([
				fetchOptionalProfile(
					async () =>
						(await unwrapBattlenetResponse(
							client.wow.CharacterSpecializationsSummary(
								job.data.realmSlug,
								job.data.characterName,
							),
						)) as CharacterSpecializationsSummary,
				),
				fetchOptionalProfile(
					async () =>
						await unwrapBattlenetResponse(
							client.wow.CharacterEquipmentSummary(
								job.data.realmSlug,
								job.data.characterName,
							),
						),
				),
				fetchOptionalProfile(
					async () =>
						(await unwrapBattlenetResponse(
							client.wow.CharacterMediaSummary(
								job.data.realmSlug,
								job.data.characterName,
							),
						)) as CharacterMediaSummary,
				),
				fetchOptionalProfile(
					async () =>
						(await unwrapBattlenetResponse(
							client.wow.CharacterMythicKeystoneProfileIndex(
								job.data.realmSlug,
								job.data.characterName,
							),
						)) as CharacterMythicKeystoneProfile,
				),
				fetchOptionalProfile(
					async () =>
						(await unwrapBattlenetResponse(
							client.wow.CharacterPvPSummary(
								job.data.realmSlug,
								job.data.characterName,
							),
						)) as CharacterPvpSummary,
				),
				fetchOptionalProfile(
					async () =>
						(await unwrapBattlenetResponse(
							client.wow.CharacterRaid(
								job.data.realmSlug,
								job.data.characterName,
							),
						)) as CharacterRaidSummary,
				),
			])

			const guildId = profile.guild
				? formatWowGuildId(job.data.region, profile.guild.id)
				: null

			if (profile.guild) {
				await db
					.insert(wowGuilds)
					.values({
						id: formatWowGuildId(job.data.region, profile.guild.id),
						region: job.data.region,
						battlenetGuildId: profile.guild.id,
						realmId: profile.guild.realm.id,
						realmSlug: profile.guild.realm.slug,
						name: profile.guild.name,
						factionType: profile.guild.faction.type,
						lastSeenAt: syncedAt,
						summaryPayload: profile.guild as unknown as Record<
							string,
							unknown
						>,
					})
					.onConflictDoUpdate({
						target: wowGuilds.id,
						set: {
							realmId: sql`excluded.realm_id`,
							realmSlug: sql`excluded.realm_slug`,
							name: sql`excluded.name`,
							factionType: sql`excluded.faction_type`,
							lastSeenAt: syncedAt,
							summaryPayload: sql`excluded.summary_payload`,
							updatedAt: syncedAt,
						},
					})
			}

			const avatarUrl = selectAvatarUrl(media)
			const activeSpec =
				specializations?.active_specialization ?? profile.active_spec
			const snapshotPayload = {
				profile,
				specializations,
				equipment,
				media,
				mythic,
				pvpSummary,
				raid,
			}

			await db
				.insert(wowCharacters)
				.values({
					id: `${job.data.region}:${profile.id}`,
					region: job.data.region,
					battlenetCharacterId: profile.id,
					realmId: profile.realm.id,
					realmSlug: profile.realm.slug,
					name: profile.name,
					classId: profile.character_class.id,
					className: profile.character_class.name,
					raceId: profile.race.id,
					raceName: profile.race.name,
					activeSpecId: activeSpec?.id,
					activeSpecName: activeSpec?.name,
					level: profile.level,
					guildId,
					avatarUrl,
					lastLoginAt: new Date(profile.last_login_timestamp),
					lastSeenAt: syncedAt,
					lastProfileSyncAt: syncedAt,
					summaryPayload: profile as unknown as Record<
						string,
						unknown
					>,
					profilePayload: snapshotPayload as unknown as Record<
						string,
						unknown
					>,
				})
				.onConflictDoUpdate({
					target: wowCharacters.id,
					set: {
						realmId: sql`excluded.realm_id`,
						realmSlug: sql`excluded.realm_slug`,
						name: sql`excluded.name`,
						classId: sql`excluded.class_id`,
						className: sql`excluded.class_name`,
						raceId: sql`excluded.race_id`,
						raceName: sql`excluded.race_name`,
						activeSpecId: sql`excluded.active_spec_id`,
						activeSpecName: sql`excluded.active_spec_name`,
						level: sql`excluded.level`,
						guildId: sql`excluded.guild_id`,
						avatarUrl: sql`excluded.avatar_url`,
						lastLoginAt: sql`excluded.last_login_at`,
						lastSeenAt: syncedAt,
						lastProfileSyncAt: syncedAt,
						summaryPayload: sql`excluded.summary_payload`,
						profilePayload: sql`excluded.profile_payload`,
						updatedAt: syncedAt,
					},
				})

			await db
				.insert(wowCharacterSnapshots)
				.values({
					characterId: `${job.data.region}:${profile.id}`,
					equippedItemLevel: profile.equipped_item_level,
					activeSpecId: activeSpec?.id,
					activeSpecName: activeSpec?.name,
					avatarUrl,
					lastLoginAt: new Date(profile.last_login_timestamp),
					mythicRating: mythic?.current_mythic_rating
						? Math.round(mythic.current_mythic_rating.rating)
						: null,
					mythicRatingColor: formatColorHex(
						mythic?.current_mythic_rating?.color,
					),
					raidProgress: summarizeRaidProgress(
						raid,
					) as unknown as Record<string, unknown> | null,
					pvpSummary: pvpSummary as unknown as Record<
						string,
						unknown
					> | null,
					snapshotAt: syncedAt,
					payload: snapshotPayload as unknown as Record<
						string,
						unknown
					>,
				})
				.onConflictDoUpdate({
					target: wowCharacterSnapshots.characterId,
					set: {
						equippedItemLevel: sql`excluded.equipped_item_level`,
						activeSpecId: sql`excluded.active_spec_id`,
						activeSpecName: sql`excluded.active_spec_name`,
						avatarUrl: sql`excluded.avatar_url`,
						lastLoginAt: sql`excluded.last_login_at`,
						mythicRating: sql`excluded.mythic_rating`,
						mythicRatingColor: sql`excluded.mythic_rating_color`,
						raidProgress: sql`excluded.raid_progress`,
						pvpSummary: sql`excluded.pvp_summary`,
						snapshotAt: syncedAt,
						payload: sql`excluded.payload`,
						updatedAt: syncedAt,
					},
				})

			await completeSyncRunSuccess({
				runId,
				provider: SYNC_PROVIDER,
				domain: WOW_PROFILE_SYNC_DOMAIN,
				entity: WOW_PROFILE_CHARACTER_ENTITY,
				scopeKey,
				region: job.data.region,
				insertedCount: guildId ? 3 : 2,
				metadata: {
					characterId: profile.id,
					guildId,
					realmSlug: profile.realm.slug,
				},
			})

			return {
				ok: true,
				characterId: profile.id,
				guildId,
			}
		} catch (error) {
			await completeSyncRunFailure({
				runId,
				provider: SYNC_PROVIDER,
				domain: WOW_PROFILE_SYNC_DOMAIN,
				entity: WOW_PROFILE_CHARACTER_ENTITY,
				scopeKey,
				region: job.data.region,
				errorMessage:
					error instanceof Error ? error.message : String(error),
				errorPayload: toErrorPayload(error),
			})

			throw error
		}
	},
})
