import { describe, expect, it } from 'vitest'

import {
	buildEventsByDay,
	eventsInRange,
	eventsForDay,
	formatHourLabelForCalendar,
	formatRangeLabel,
	getDayKey,
	getHourForTimeZone,
	getMonthGridDays,
	getVisibleRangeForTimeZone,
	isSameCalendarDay,
	getVisibleRange,
	resolveEvents,
} from './utils'

describe('calendar utils', () => {
	it('builds a date-aligned month grid with outside days', () => {
		const days = getMonthGridDays(new Date(2026, 3, 12), 0)

		expect(days.length).toBe(35)
		expect(days[0]?.getFullYear()).toBe(2026)
		expect(days[0]?.getMonth()).toBe(2)
		expect(days[0]?.getDate()).toBe(29)
		expect(days[days.length - 1]?.getFullYear()).toBe(2026)
		expect(days[days.length - 1]?.getMonth()).toBe(4)
		expect(days[days.length - 1]?.getDate()).toBe(2)
	})

	it('gets month visible range from week start to week end', () => {
		const range = getVisibleRange('month', new Date(2026, 3, 5, 12), 1)

		expect(range.start.getFullYear()).toBe(2026)
		expect(range.start.getMonth()).toBe(2)
		expect(range.start.getDate()).toBe(30)
		expect(range.end.getFullYear()).toBe(2026)
		expect(range.end.getMonth()).toBe(4)
		expect(range.end.getDate()).toBe(3)
	})

	it('resolves and sorts valid events only', () => {
		const events = resolveEvents([
			{
				id: 'b',
				title: 'B',
				startUtc: '2026-04-10T00:00:00.000Z',
				endUtc: '2026-04-10T01:00:00.000Z',
			},
			{
				id: 'bad',
				title: 'Bad',
				startUtc: 'not-a-date',
				endUtc: '2026-04-10T01:00:00.000Z',
			},
			{
				id: 'a',
				title: 'A',
				startUtc: '2026-04-09T00:00:00.000Z',
				endUtc: '2026-04-09T01:00:00.000Z',
			},
		])

		expect(events.map((event) => event.id)).toEqual(['a', 'b'])
	})

	it('matches events by timezone day key', () => {
		const events = resolveEvents([
			{
				id: 'tz',
				title: 'TZ Event',
				startUtc: '2026-01-01T23:30:00.000Z',
				endUtc: '2026-01-02T00:30:00.000Z',
			},
		])

		const tokyoDay = new Date('2026-01-02T00:00:00.000Z')
		const utcDay = new Date('2026-01-01T00:00:00.000Z')

		expect(eventsForDay(events, tokyoDay, 'Asia/Tokyo').length).toBe(1)
		expect(eventsForDay(events, utcDay, 'UTC').length).toBe(1)
	})

	it('computes timezone hour safely', () => {
		const date = new Date('2026-04-17T18:45:00.000Z')

		expect(getHourForTimeZone(date, 'UTC')).toBe(18)
		expect(getHourForTimeZone(date, 'America/New_York')).toBeTypeOf(
			'number',
		)
	})

	it('formats range labels for week view', () => {
		const label = formatRangeLabel(
			'week',
			new Date('2026-04-17T00:00:00.000Z'),
			1,
			'UTC',
		)

		expect(label).toMatch(/Apr/)
		expect(label).toMatch(/2026/)
	})

	it('formats hour labels from wall-clock hour without timezone drift', () => {
		expect(formatHourLabelForCalendar(0, '24h')).toBe('00')
		expect(formatHourLabelForCalendar(13, '24h')).toBe('13')
	})

	it('compares calendar days using configured timezone keys', () => {
		const now = new Date('2026-04-20T00:30:00.000Z')
		const candidate = new Date('2026-04-19T12:00:00.000Z')

		expect(isSameCalendarDay(candidate, now, 'America/Los_Angeles')).toBe(
			true,
		)
		expect(isSameCalendarDay(candidate, now, 'UTC')).toBe(false)
	})

	it('computes week range in timezone and preserves boundary events', () => {
		const targetDate = new Date('2026-04-20T12:00:00.000Z')
		const range = getVisibleRangeForTimeZone('week', targetDate, 1, 'UTC')

		expect(getDayKey(range.start, 'UTC')).toBe('2026-04-20')
		expect(getDayKey(range.end, 'UTC')).toBe('2026-04-26')

		const events = resolveEvents([
			{
				id: 'e1',
				title: 'Late Sunday event',
				startUtc: '2026-04-26T23:30:00.000Z',
				endUtc: '2026-04-26T23:45:00.000Z',
			},
		])

		const visible = eventsInRange(events, range.start, range.end)
		expect(visible).toHaveLength(1)

		const byDay = buildEventsByDay(visible, range.start, range.end, 'UTC')
		expect(byDay.get('2026-04-26')).toHaveLength(1)
	})
})
