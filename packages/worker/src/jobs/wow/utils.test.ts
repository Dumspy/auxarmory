import { describe, expect, it } from 'vitest'

import {
	buildWowWeeklyResetKey,
	getMostRecentWeeklyResetAt,
	isRegionWeeklySyncDue,
} from './utils.js'

describe('weekly reset helpers', () => {
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
})
