import * as Sentry from '@sentry/node'

import { ApplicationClient } from '@auxarmory/battlenet'
import { RegionsConst } from '@auxarmory/battlenet/types'
import type { ClientReturn, Regions } from '@auxarmory/battlenet/types'
import {
	createBattlenetJobCaptureContext,
	createBattlenetSentryMiddleware,
} from '@auxarmory/observability'

import { z } from 'zod'

import { env } from '../../env.js'
import { persistBattlenetFailureViaInternalApi } from '../shared/battlenet_failure_sink.js'
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

export type WowSyncRegion = Exclude<Regions, 'cn'>

const [US_REGION, EU_REGION, KR_REGION, TW_REGION] = RegionsConst

export const WOW_SYNC_REGIONS = [
	US_REGION,
	EU_REGION,
	KR_REGION,
	TW_REGION,
] as const satisfies readonly WowSyncRegion[]

export const wowStaticWeeklyCoordinatorJobPayloadSchema = z.object({
	triggeredBy: syncRunTriggerSchema.default('scheduler'),
	force: z.boolean().default(false),
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

function getWeeklyResetConfig(region: WowSyncRegion): WeeklyResetUtcConfig {
	const config = WOW_WEEKLY_RESET_UTC_BY_REGION[region]

	if (!config) {
		throw new Error(`Unsupported WoW sync region: ${region}`)
	}

	return config
}

export function getMostRecentWeeklyResetAt(
	region: WowSyncRegion,
	at: Date = new Date(),
): Date {
	const config = getWeeklyResetConfig(region)
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
	const normalizedResetKey = resetKey.replaceAll(':', '-')
	return `wow-static-weekly-region-${region}-${normalizedResetKey}`
}

export function formatWowStaticWeeklyEntityJobId(
	entity: string,
	region: WowSyncRegion,
	resetKey: string,
): string {
	const normalizedEntity = entity.replaceAll(':', '-')
	const normalizedResetKey = resetKey.replaceAll(':', '-')

	return `wow-static-weekly-${normalizedEntity}-${region}-${normalizedResetKey}`
}

export function parseConnectedRealmIdFromHref(href: string): number | null {
	const match = href.match(/connected-realm\/(\d+)/)
	if (!match?.[1]) {
		return null
	}

	const id = Number.parseInt(match[1], 10)
	return Number.isFinite(id) ? id : null
}

function createBattlenetClient(
	region: WowSyncRegion,
	captureException: Parameters<
		typeof createBattlenetSentryMiddleware
	>[0]['captureException'] = Sentry.captureException,
	baseContext?: ReturnType<typeof createBattlenetJobCaptureContext>,
) {
	return new ApplicationClient({
		clientId: env.BATTLENET_CLIENT_ID,
		clientSecret: env.BATTLENET_CLIENT_SECRET,
		region,
		locale: 'en_US',
		middleware: [
			createBattlenetSentryMiddleware({
				service: 'worker',
				captureException,
				persistFailure: persistBattlenetFailureViaInternalApi,
				baseContext,
			}),
		],
	})
}

export function createJobBattlenetClient(
	job: Parameters<typeof createBattlenetJobCaptureContext>[0],
	meta?: Parameters<typeof createBattlenetJobCaptureContext>[1],
) {
	const context = createBattlenetJobCaptureContext(job, meta)
	const region = meta?.region ?? context.tags.region
	if (!region || !WOW_SYNC_REGIONS.includes(region as WowSyncRegion)) {
		throw new Error(
			'Job payload region missing; cannot create battlenet client',
		)
	}

	return createBattlenetClient(
		region as WowSyncRegion,
		(error, baseContext) => {
			Sentry.captureException(error, {
				...baseContext,
				tags: {
					...baseContext?.tags,
					...context.tags,
				},
				extra: {
					...baseContext?.extra,
					...context.extra,
				},
				contexts: {
					...baseContext?.contexts,
					...context.contexts,
				},
			})
		},
		context,
	)
}

export async function unwrapBattlenetResponse<T>(
	response: Promise<ClientReturn<T>>,
): Promise<T> {
	const res = await response
	if (res.success) {
		return res.data
	}

	throw res.error
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
