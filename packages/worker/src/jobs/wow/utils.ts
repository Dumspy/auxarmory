import { ApplicationClient } from '@auxarmory/battlenet'
import { z } from 'zod'
import { syncRunTriggerSchema } from '../shared/sync_runtime.js'

export {
	completeSyncRunFailure,
	completeSyncRunSuccess,
	getSyncStateByScope,
	startSyncRun,
	toErrorPayload,
	type CompleteSyncRunInput,
	type SyncRunTrigger,
	type StartSyncRunInput,
	type SyncRunScope,
} from '../shared/sync_runtime.js'

export { syncRunTriggerSchema }

export const SYNC_PROVIDER = 'battlenet'
export const SYNC_DOMAIN = 'wow'
export const WOW_STATIC_WEEKLY_COORDINATOR_ENTITY = 'static-weekly-coordinator'
export const WOW_STATIC_WEEKLY_REGION_ENTITY = 'static-weekly-region'
export const WOW_STATIC_WEEKLY_CONNECTED_REALMS_ENTITY =
	'static-weekly-connected-realms'
export const WOW_STATIC_WEEKLY_REALMS_ENTITY = 'static-weekly-realms'
export const WOW_STATIC_WEEKLY_PLAYABLE_CLASSES_ENTITY =
	'static-weekly-playable-classes'
export const WOW_STATIC_WEEKLY_PLAYABLE_RACES_ENTITY =
	'static-weekly-playable-races'
export const WOW_STATIC_WEEKLY_PLAYABLE_SPECIALIZATIONS_ENTITY =
	'static-weekly-playable-specializations'
export const WOW_STATIC_WEEKLY_PROFESSIONS_ENTITY = 'static-weekly-professions'

type BattlenetRegion = ConstructorParameters<
	typeof ApplicationClient
>[0]['region']

export const WOW_SYNC_REGIONS = [
	'us',
	'eu',
	'kr',
	'tw',
] as const satisfies readonly BattlenetRegion[]

export type WowSyncRegion = (typeof WOW_SYNC_REGIONS)[number]

export const wowStaticWeeklyCoordinatorJobPayloadSchema = z.object({
	triggeredBy: syncRunTriggerSchema.default('scheduler'),
})

export type WowStaticWeeklyCoordinatorJobPayload = z.infer<
	typeof wowStaticWeeklyCoordinatorJobPayloadSchema
>

export const wowStaticWeeklyRegionJobPayloadSchema = z.object({
	region: z.enum(WOW_SYNC_REGIONS),
	resetKey: z.string().min(1),
	triggeredBy: syncRunTriggerSchema.default('scheduler'),
})

export type WowStaticWeeklyRegionJobPayload = z.infer<
	typeof wowStaticWeeklyRegionJobPayloadSchema
>

export const wowStaticWeeklyEntityJobPayloadSchema = z.object({
	region: z.enum(WOW_SYNC_REGIONS),
	resetKey: z.string().min(1),
	triggeredBy: syncRunTriggerSchema.default('scheduler'),
})

export type WowStaticWeeklyEntityJobPayload = z.infer<
	typeof wowStaticWeeklyEntityJobPayloadSchema
>

interface WeeklyResetUtcConfig {
	dayOfWeek: number
	hour: number
	minute: number
}

export const WOW_WEEKLY_RESET_UTC_BY_REGION: Record<
	WowSyncRegion,
	WeeklyResetUtcConfig
> = {
	us: { dayOfWeek: 2, hour: 15, minute: 0 },
	eu: { dayOfWeek: 3, hour: 7, minute: 0 },
	kr: { dayOfWeek: 3, hour: 1, minute: 0 },
	tw: { dayOfWeek: 3, hour: 1, minute: 0 },
}

function toResetKey(date: Date): string {
	return date.toISOString().slice(0, 16)
}

export function getMostRecentWeeklyResetAt(
	region: WowSyncRegion,
	at: Date = new Date(),
): Date {
	const config = WOW_WEEKLY_RESET_UTC_BY_REGION[region]
	const current = new Date(at)

	const dayOffset = (current.getUTCDay() - config.dayOfWeek + 7) % 7

	const candidate = new Date(
		Date.UTC(
			current.getUTCFullYear(),
			current.getUTCMonth(),
			current.getUTCDate() - dayOffset,
			config.hour,
			config.minute,
			0,
			0,
		),
	)

	if (candidate.getTime() > current.getTime()) {
		candidate.setUTCDate(candidate.getUTCDate() - 7)
	}

	return candidate
}

export function buildWowWeeklyResetKey(
	region: WowSyncRegion,
	at: Date = new Date(),
): string {
	return `${region}:${toResetKey(getMostRecentWeeklyResetAt(region, at))}`
}

export function isRegionWeeklySyncDue(args: {
	region: WowSyncRegion
	lastResetKey: string | null | undefined
	at?: Date
}): {
	due: boolean
	resetKey: string
	resetAt: Date
} {
	const resetAt = getMostRecentWeeklyResetAt(args.region, args.at)
	const resetKey = `${args.region}:${toResetKey(resetAt)}`

	return {
		due: args.lastResetKey !== resetKey,
		resetKey,
		resetAt,
	}
}

export function formatWowStaticWeeklyRegionJobId(
	region: WowSyncRegion,
	resetKey: string,
): string {
	return `wow-static-weekly:region:${region}:${resetKey}`
}

export function formatWowStaticWeeklyEntityJobId(
	entity: string,
	region: WowSyncRegion,
	resetKey: string,
): string {
	return `wow-static-weekly:${entity}:${region}:${resetKey}`
}

export const battlenetEnvSchema = z.object({
	BATTLENET_CLIENT_ID: z.string().min(1),
	BATTLENET_CLIENT_SECRET: z.string().min(1),
})

export function createBattlenetClient(region: WowSyncRegion) {
	const env = battlenetEnvSchema.parse(process.env)

	return new ApplicationClient({
		clientId: env.BATTLENET_CLIENT_ID,
		clientSecret: env.BATTLENET_CLIENT_SECRET,
		region,
		locale: 'en_US',
	})
}

export function localizeName(value: unknown): string | null {
	if (value === null) {
		return null
	}

	if (typeof value === 'string') {
		return value
	}

	if (typeof value !== 'object') {
		return null
	}

	const localeObject = value as Record<string, unknown>
	const defaultLocaleValue = localeObject.en_US

	if (typeof defaultLocaleValue === 'string') {
		return defaultLocaleValue
	}

	return null
}

type BattlenetClientResponse<T> =
	| {
			success: true
			data: T
	  }
	| {
			success: false
			error: unknown
			error_type: string
			request_context: {
				endpoint: string
			}
	  }

export function unwrap<T>(response: BattlenetClientResponse<T>): T {
	if (response.success) {
		return response.data
	}

	throw new Error(
		`Battle.net request failed with ${response.error_type} error for ${response.request_context.endpoint}`,
		{
			cause: response.error,
		},
	)
}
