import {
	createContext,
	type PropsWithChildren,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react'

import type {
	CalendarResolvedEvent,
	CalendarRootProps,
	CalendarSlots,
	CalendarTimeFormat,
	CalendarView,
	CalendarVisibleRange,
} from './types'
import {
	buildEventsByDay,
	eventsInRange,
	formatRangeLabel,
	getNextDate,
	getPrevDate,
	getVisibleRangeForTimeZone,
	resolveEvents,
} from './utils'

const DEFAULT_AVAILABLE_VIEWS: CalendarView[] = [
	'year',
	'month',
	'week',
	'day',
	'agenda',
]

interface CalendarContextValue {
	currentDate: Date
	setCurrentDate: (date: Date) => void
	view: CalendarView
	setView: (view: CalendarView) => void
	availableViews: CalendarView[]
	range: CalendarVisibleRange
	rangeLabel: string
	visibleEvents: CalendarResolvedEvent[]
	eventsByDay: Map<string, CalendarResolvedEvent[]>
	timeZone: string | undefined
	timeFormat: CalendarTimeFormat
	weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
	maxVisibleEventsPerDay: number
	showOutsideDays: boolean
	headerTitle: ReactNode | undefined
	slots: CalendarSlots | undefined
	next: () => void
	prev: () => void
	today: () => void
	goToDate: (date: Date) => void
}

const CalendarContext = createContext<CalendarContextValue | null>(null)

function getResolvedTimeZone(timeZone: CalendarRootProps['timeZone']) {
	if (timeZone === 'local') {
		return Intl.DateTimeFormat().resolvedOptions().timeZone
	}

	if (timeZone === 'UTC') {
		return 'UTC'
	}

	return timeZone
}

function getAvailableViews(availableViews?: CalendarView[]): CalendarView[] {
	if (!availableViews || availableViews.length === 0) {
		return DEFAULT_AVAILABLE_VIEWS
	}

	return Array.from(new Set(availableViews))
}

export function useCalendar(): CalendarContextValue {
	const context = useContext(CalendarContext)
	if (!context) {
		throw new Error('useCalendar must be used within a CalendarProvider.')
	}

	return context
}

export function CalendarProvider({
	children,
	date,
	defaultDate,
	onDateChange,
	view,
	defaultView,
	onViewChange,
	availableViews,
	events,
	headerTitle,
	timeZone,
	timeFormat = 'locale',
	weekStartsOn = 0,
	maxVisibleEventsPerDay = 3,
	showOutsideDays = true,
	slots,
}: PropsWithChildren<CalendarRootProps>) {
	const [internalDate, setInternalDate] = useState<Date>(
		defaultDate ?? new Date(),
	)
	const [internalView, setInternalView] = useState<CalendarView>(
		defaultView ?? 'month',
	)

	const currentDate = date ?? internalDate
	const availableViewList = useMemo(
		() => getAvailableViews(availableViews),
		[availableViews],
	)

	const viewFromState = view ?? internalView
	const currentView = availableViewList.includes(viewFromState)
		? viewFromState
		: (availableViewList[0] ?? 'month')

	const setCurrentDate = useCallback(
		(nextDate: Date) => {
			onDateChange?.(nextDate)
			if (!date) {
				setInternalDate(nextDate)
			}
		},
		[date, onDateChange],
	)

	const setView = useCallback(
		(nextView: CalendarView) => {
			if (!availableViewList.includes(nextView)) {
				return
			}

			onViewChange?.(nextView)
			if (!view) {
				setInternalView(nextView)
			}
		},
		[availableViewList, onViewChange, view],
	)

	const resolvedTimeZone = getResolvedTimeZone(timeZone)
	const allEvents = useMemo(() => resolveEvents(events), [events])

	const range = useMemo(
		() =>
			getVisibleRangeForTimeZone(
				currentView,
				currentDate,
				weekStartsOn,
				resolvedTimeZone,
			),
		[currentDate, currentView, resolvedTimeZone, weekStartsOn],
	)

	const visibleEvents = useMemo(
		() => eventsInRange(allEvents, range.start, range.end),
		[allEvents, range.end, range.start],
	)

	const rangeLabel = useMemo(
		() =>
			formatRangeLabel(
				currentView,
				currentDate,
				weekStartsOn,
				resolvedTimeZone,
			),
		[currentDate, currentView, resolvedTimeZone, weekStartsOn],
	)

	const eventsByDay = useMemo(
		() =>
			buildEventsByDay(
				visibleEvents,
				range.start,
				range.end,
				resolvedTimeZone,
			),
		[range.end, range.start, resolvedTimeZone, visibleEvents],
	)

	const goToDate = useCallback(
		(nextDate: Date) => {
			setCurrentDate(nextDate)
		},
		[setCurrentDate],
	)

	const today = useCallback(() => {
		setCurrentDate(new Date())
	}, [setCurrentDate])

	const next = useCallback(() => {
		setCurrentDate(getNextDate(currentView, currentDate))
	}, [currentDate, currentView, setCurrentDate])

	const prev = useCallback(() => {
		setCurrentDate(getPrevDate(currentView, currentDate))
	}, [currentDate, currentView, setCurrentDate])

	const value = useMemo<CalendarContextValue>(
		() => ({
			currentDate,
			setCurrentDate,
			view: currentView,
			setView,
			availableViews: availableViewList,
			range,
			rangeLabel,
			visibleEvents,
			eventsByDay,
			timeZone: resolvedTimeZone,
			timeFormat,
			weekStartsOn,
			maxVisibleEventsPerDay,
			showOutsideDays,
			headerTitle,
			slots,
			next,
			prev,
			today,
			goToDate,
		}),
		[
			availableViewList,
			currentDate,
			currentView,
			eventsByDay,
			goToDate,
			headerTitle,
			maxVisibleEventsPerDay,
			next,
			prev,
			range,
			rangeLabel,
			resolvedTimeZone,
			setCurrentDate,
			setView,
			showOutsideDays,
			slots,
			timeFormat,
			today,
			visibleEvents,
			weekStartsOn,
		],
	)

	return (
		<CalendarContext.Provider value={value}>
			{children}
		</CalendarContext.Provider>
	)
}
