import { z } from 'zod'

import { syncRunTriggerSchema } from './utils.js'

export const WOW_PROFILE_SYNC_DOMAIN = 'wow-user'
export const WOW_PROFILE_ACCOUNT_COORDINATOR_ENTITY =
	'profile-account-coordinator'
export const WOW_PROFILE_ACCOUNT_ENTITY = 'profile-account'
export const WOW_PROFILE_CHARACTER_ENTITY = 'profile-character'
export const WOW_PROFILE_ACCOUNT_COORDINATOR_SCHEDULE_ID =
	'sync-wow-profile-account-coordinator'
export const WOW_PROFILE_ACCOUNT_COORDINATOR_SCHEDULE_EVERY_MS =
	4 * 60 * 60 * 1000
export const WOW_PROFILE_MIN_CHARACTER_LEVEL = 30

export const wowProfileAccountCoordinatorJobPayloadSchema = z.object({
	userId: z.string().min(1).optional(),
	triggeredBy: syncRunTriggerSchema.default('manual'),
	force: z.boolean().default(false),
})

export type WowProfileAccountCoordinatorJobPayload = z.infer<
	typeof wowProfileAccountCoordinatorJobPayloadSchema
>

export const wowProfileAccountJobPayloadSchema = z.object({
	authAccountId: z.string().min(1),
	triggeredBy: syncRunTriggerSchema.default('manual'),
	force: z.boolean().default(false),
})

export type WowProfileAccountJobPayload = z.infer<
	typeof wowProfileAccountJobPayloadSchema
>

export const wowProfileCharacterJobPayloadSchema = z.object({
	authAccountId: z.string().min(1),
	characterId: z.string().min(1),
	region: z.string().min(1),
	realmSlug: z.string().min(1),
	characterName: z.string().min(1),
	triggeredBy: syncRunTriggerSchema.default('manual'),
	force: z.boolean().default(false),
})

export type WowProfileCharacterJobPayload = z.infer<
	typeof wowProfileCharacterJobPayloadSchema
>

export function formatWowProfileCoordinatorJobId(userId: string): string {
	return `wow-profile-coordinator-${userId}`
}

export function formatWowProfileAccountJobId(authAccountId: string): string {
	return `wow-profile-account-${authAccountId}`
}

export function formatWowProfileCharacterJobId(
	region: string,
	characterId: string,
): string {
	const normalizedRegion = region.toLowerCase()
	return `wow-profile-character-${normalizedRegion}-${characterId}`
}
