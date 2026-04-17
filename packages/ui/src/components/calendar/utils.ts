import {
	addDays,
	addMonths,
	addWeeks,
	addYears,
	eachDayOfInterval,
	endOfDay,
	endOfMonth,
	endOfWeek,
	endOfYear,
	format,
	getDay,
	isWithinInterval,
	parseISO,
	startOfDay,
	startOfMonth,
	startOfWeek,
	startOfYear,
	subMonths,
	subWeeks,
	subYears,
} from 'date-fns'

import type {
	CalendarDateInput,
	CalendarEvent,
	CalendarResolvedEvent,
	CalendarView,
	CalendarVisibleRange,
} from './types'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dayKeyFormatterCache = new Map<string, Intl.DateTimeFormat>()
const hourFormatterCache = new Map<string, Intl.DateTimeFormat>()

function getCachedDayKeyFormatter(timeZone: string): Intl.DateTimeFormat {
	const cached = dayKeyFormatterCache.get(timeZone)
	if (cached) {
		return cached
	}

	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	})

	dayKeyFormatterCache.set(timeZone, formatter)
	return formatter
}

function getCachedHourFormatter(timeZone: string): Intl.DateTimeFormat {
	const cached = hourFormatterCache.get(timeZone)
	if (cached) {
		return cached
	}

	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hour: '2-digit',
		hour12: false,
	})

	hourFormatterCache.set(timeZone, formatter)
	return formatter
}

function asDate(value: CalendarDateInput): Date {
	if (value instanceof Date) {
		return new Date(value)
	}

	if (typeof value === 'string') {
		return parseISO(value)
	}

	return new Date(value)
}

export function resolveEvents(
	events: CalendarEvent[],
): CalendarResolvedEvent[] {
	return events
		.map((event) => {
			const startDate = asDate(event.startUtc)
			const endDate = asDate(event.endUtc)

			return {
				...event,
				startDate,
				endDate,
			}
		})
		.filter((event) => !Number.isNaN(event.startDate.valueOf()))
		.filter((event) => !Number.isNaN(event.endDate.valueOf()))
		.sort((a, b) => a.startDate.valueOf() - b.startDate.valueOf())
}

export function getVisibleRange(
	view: CalendarView,
	date: Date,
	weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
): CalendarVisibleRange {
	if (view === 'agenda') {
		return {
			start: startOfDay(date),
			end: endOfDay(addDays(date, 90)),
		}
	}

	if (view === 'day') {
		return {
			start: startOfDay(date),
			end: endOfDay(date),
		}
	}

	if (view === 'week') {
		return {
			start: startOfWeek(date, { weekStartsOn }),
			end: endOfWeek(date, { weekStartsOn }),
		}
	}

	if (view === 'year') {
		return {
			start: startOfYear(date),
			end: endOfYear(date),
		}
	}

	const monthStart = startOfMonth(date)
	const monthEnd = endOfMonth(date)

	return {
		start: startOfWeek(monthStart, { weekStartsOn }),
		end: endOfWeek(monthEnd, { weekStartsOn }),
	}
}

export function getNextDate(view: CalendarView, date: Date): Date {
	if (view === 'agenda') {
		return addWeeks(date, 2)
	}

	if (view === 'day') {
		return addDays(date, 1)
	}

	if (view === 'week') {
		return addWeeks(date, 1)
	}

	if (view === 'year') {
		return addYears(date, 1)
	}

	return addMonths(date, 1)
}

export function getPrevDate(view: CalendarView, date: Date): Date {
	if (view === 'agenda') {
		return subWeeks(date, 2)
	}

	if (view === 'day') {
		return addDays(date, -1)
	}

	if (view === 'week') {
		return subWeeks(date, 1)
	}

	if (view === 'year') {
		return subYears(date, 1)
	}

	return subMonths(date, 1)
}

export function getWeekdayLabels(
	weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
): string[] {
	return Array.from({ length: 7 }, (_, index) => {
		const dayIndex = (weekStartsOn + index) % 7
		return WEEKDAY_LABELS[dayIndex] ?? 'Day'
	})
}

export function getMonthGridDays(
	date: Date,
	weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
): Date[] {
	const range = getVisibleRange('month', date, weekStartsOn)
	return eachDayOfInterval(range)
}

export function getWeekDays(
	date: Date,
	weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
): Date[] {
	const start = startOfWeek(date, { weekStartsOn })
	const end = endOfWeek(date, { weekStartsOn })

	return eachDayOfInterval({ start, end })
}

export function getYearMonths(date: Date): Date[] {
	const yearStart = startOfYear(date)
	return Array.from({ length: 12 }, (_, index) => addMonths(yearStart, index))
}

export function eventsInRange(
	events: CalendarResolvedEvent[],
	start: Date,
	end: Date,
): CalendarResolvedEvent[] {
	const interval = { start, end }
	return events.filter((event) => {
		if (event.allDay) {
			return (
				isWithinInterval(startOfDay(event.startDate), interval) ||
				isWithinInterval(startOfDay(event.endDate), interval) ||
				(startOfDay(event.startDate) < start &&
					startOfDay(event.endDate) > end)
			)
		}

		return (
			isWithinInterval(event.startDate, interval) ||
			isWithinInterval(event.endDate, interval) ||
			(event.startDate < start && event.endDate > end)
		)
	})
}

export function eventsForDay(
	events: CalendarResolvedEvent[],
	day: Date,
	timeZone?: string,
): CalendarResolvedEvent[] {
	const dayKey = getDayKey(day, timeZone)

	return events.filter((event) => {
		if (event.allDay) {
			const start = startOfDay(event.startDate)
			const end = startOfDay(event.endDate)
			return day >= start && day <= end
		}

		return (
			getDayKey(event.startDate, timeZone) === dayKey ||
			getDayKey(event.endDate, timeZone) === dayKey
		)
	})
}

export function getDayKey(date: Date, timeZone?: string): string {
	if (!timeZone) {
		const year = date.getFullYear()
		const month = `${date.getMonth() + 1}`.padStart(2, '0')
		const day = `${date.getDate()}`.padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	return getCachedDayKeyFormatter(timeZone).format(date)
}

export function getHourForTimeZone(date: Date, timeZone?: string): number {
	if (!timeZone) {
		return date.getHours()
	}

	const parts = getCachedHourFormatter(timeZone).formatToParts(date)

	const hourPart = parts.find((part) => part.type === 'hour')
	const parsed = Number(hourPart?.value ?? '0')
	return Number.isNaN(parsed) ? 0 : parsed
}

export function buildEventsByDay(
	events: CalendarResolvedEvent[],
	start: Date,
	end: Date,
	timeZone?: string,
): Map<string, CalendarResolvedEvent[]> {
	const eventMap = new Map<string, CalendarResolvedEvent[]>()
	const startDay = startOfDay(start)
	const endDay = startOfDay(end)

	function add(day: Date, event: CalendarResolvedEvent) {
		const key = getDayKey(day, timeZone)
		const existing = eventMap.get(key)
		if (existing) {
			existing.push(event)
			return
		}

		eventMap.set(key, [event])
	}

	for (const event of events) {
		if (event.allDay) {
			const eventStart = startOfDay(event.startDate)
			const eventEnd = startOfDay(event.endDate)
			if (eventEnd < startDay || eventStart > endDay) {
				continue
			}

			const intervalStart = eventStart > startDay ? eventStart : startDay
			const intervalEnd = eventEnd < endDay ? eventEnd : endDay

			for (const day of eachDayOfInterval({
				start: intervalStart,
				end: intervalEnd,
			})) {
				add(day, event)
			}
			continue
		}

		const startKey = getDayKey(event.startDate, timeZone)
		add(event.startDate, event)

		const endKey = getDayKey(event.endDate, timeZone)
		if (endKey !== startKey) {
			add(event.endDate, event)
		}
	}

	return eventMap
}

export function formatRangeLabel(
	view: CalendarView,
	date: Date,
	weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
	timeZone?: string,
): string {
	if (view === 'year') {
		return format(date, 'yyyy')
	}

	if (view === 'month') {
		if (timeZone) {
			return new Intl.DateTimeFormat(undefined, {
				month: 'long',
				year: 'numeric',
				timeZone,
			}).format(date)
		}

		return format(date, 'MMMM yyyy')
	}

	if (view === 'day') {
		if (timeZone) {
			return new Intl.DateTimeFormat(undefined, {
				weekday: 'long',
				month: 'long',
				day: 'numeric',
				year: 'numeric',
				timeZone,
			}).format(date)
		}

		return format(date, 'EEEE, MMMM d, yyyy')
	}

	if (view === 'agenda') {
		const end = addDays(date, 90)
		if (timeZone) {
			const formatter = new Intl.DateTimeFormat(undefined, {
				month: 'short',
				day: 'numeric',
				timeZone,
			})
			const year = new Intl.DateTimeFormat(undefined, {
				year: 'numeric',
				timeZone,
			}).format(end)
			return `${formatter.format(date)} - ${formatter.format(end)}, ${year}`
		}

		return `${format(date, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
	}

	const weekDays = getWeekDays(date, weekStartsOn)
	const start = weekDays[0] ?? date
	const end = weekDays[6] ?? date

	if (timeZone) {
		const formatter = new Intl.DateTimeFormat(undefined, {
			month: 'short',
			day: 'numeric',
			timeZone,
		})
		const year = new Intl.DateTimeFormat(undefined, {
			year: 'numeric',
			timeZone,
		}).format(end)
		return `${formatter.format(start)} - ${formatter.format(end)}, ${year}`
	}

	return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
}

export function getMonthOffset(
	monthDate: Date,
	weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
): number {
	const day = getDay(startOfMonth(monthDate))
	return (day - weekStartsOn + 7) % 7
}
