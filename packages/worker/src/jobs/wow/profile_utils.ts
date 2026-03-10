import { z } from 'zod'

import { syncRunTriggerSchema } from './utils.js'

export const WOW_PROFILE_SYNC_DOMAIN = 'wow-user'
export const WOW_PROFILE_ACCOUNT_COORDINATOR_ENTITY =
	'profile-account-coordinator'
export const WOW_PROFILE_ACCOUNT_ENTITY = 'profile-account'

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

export function formatWowProfileAccountJobId(authAccountId: string) {
	return `wow-profile-account-${authAccountId.replaceAll(':', '-')}`
}
