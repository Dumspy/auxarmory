import { describe, expect, it } from 'vitest'

import {
	buildWowWeeklyResetKey,
	formatWowStaticWeeklyEntityJobId,
	formatWowStaticWeeklyRegionJobId,
	getMostRecentWeeklyResetAt,
	isRegionWeeklySyncDue,
	parseConnectedRealmIdFromHref,
	WOW_SYNC_REGIONS,
} from './utils'

describe('weekly reset helpers', () => {
	it('uses one shared wow region list', () => {
		expect(WOW_SYNC_REGIONS).toEqual(['us', 'eu', 'kr', 'tw'])
	})

	it('builds a stable reset key for a region and week', () => {
		const now = new Date('2026-03-06T12:00:00.000Z')

		expect(buildWowWeeklyResetKey('us', now)).toBe('us:2026-03-03T15:00')
		expect(buildWowWeeklyResetKey('eu', now)).toBe('eu:2026-03-04T07:00')
	})

	it('uses the previous week when current week reset is in the future', () => {
		const now = new Date('2026-03-03T14:59:00.000Z')
		const reset = getMostRecentWeeklyResetAt('us', now)

		expect(reset.toISOString()).toBe('2026-02-24T15:00:00.000Z')
	})

	it('marks sync as due only when reset key changed', () => {
		const now = new Date('2026-03-06T12:00:00.000Z')
		const dueCheck = isRegionWeeklySyncDue({
			region: 'us',
			lastResetKey: 'us:2026-02-24T15:00',
			at: now,
		})

		expect(dueCheck.due).toBe(true)
		expect(dueCheck.resetKey).toBe('us:2026-03-03T15:00')

		const notDueCheck = isRegionWeeklySyncDue({
			region: 'us',
			lastResetKey: dueCheck.resetKey,
			at: now,
		})

		expect(notDueCheck.due).toBe(false)
	})

	it('formats deterministic weekly job IDs without colons', () => {
		const regionJobId = formatWowStaticWeeklyRegionJobId(
			'us',
			'us:2026-03-03T15:00',
		)
		const entityJobId = formatWowStaticWeeklyEntityJobId(
			'connected-realms',
			'us',
			'us:2026-03-03T15:00',
		)

		expect(regionJobId).toBe(
			'wow-static-weekly-region-us-us-2026-03-03T15-00',
		)
		expect(entityJobId).toBe(
			'wow-static-weekly-connected-realms-us-us-2026-03-03T15-00',
		)
		expect(regionJobId.includes(':')).toBe(false)
		expect(entityJobId.includes(':')).toBe(false)
	})

	it('parses connected realm IDs from href values', () => {
		expect(
			parseConnectedRealmIdFromHref(
				'https://us.api.blizzard.com/data/wow/connected-realm/1136?namespace=dynamic-us',
			),
		).toBe(1136)

		expect(
			parseConnectedRealmIdFromHref('/data/wow/connected-realm/42'),
		).toBe(42)

		expect(
			parseConnectedRealmIdFromHref(
				'https://example.com/data/wow/realm/1',
			),
		).toBeNull()
		expect(parseConnectedRealmIdFromHref('')).toBeNull()
	})
})
